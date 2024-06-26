'''
main.py

A module that contains the main forklift pallets for deq

Note: There is a separate scheduled task that runs this pallet for
SGID.ENVIRONMENT.DAQAirMonitorByStation on an hourly basis.
'''

from os import path

import arcpy
from update_app_database import get_spreadsheet_configs_for_crates
import settings
import update_fgdb
import update_sgid
import update_app_database
from forklift.models import Crate, Pallet
from settings import fieldnames

current_folder = path.dirname(path.realpath(__file__))
STREAMS = 'StreamsNHDHighRes'
ARCGIS_SERVICES = [
    ('DEQEnviro/MapService', 'MapServer'),
    ('DEQEnviro/Secure', 'MapServer'),
    ('DEQEnviro/ExportWebMap', 'GPServer'),
    ('DEQEnviro/Toolbox', 'GPServer')
]


class DEQNightly0DeleteRelationshipClassesPallet(Pallet):
    def __init__(self, test_layer=None):
        super(DEQNightly0DeleteRelationshipClassesPallet, self).__init__()

    def prepare_packaging(self):
        update_fgdb.delete_relationship_classes(self.staging_rack)


class DEQNightly1UpdatePallet(Pallet):
    #: this is for all non-etl data updates to the app database
    #: the corresponding SGID data is updated in the ship method
    def __init__(self, test_layer=None):
        super(DEQNightly1UpdatePallet, self).__init__()

        self.problem_layer_infos = []

        self.test_layer = test_layer

        self.deqquerylayers = path.join(self.staging_rack, settings.fgd)
        self.copy_data = [self.deqquerylayers]
        self.arcgis_services = ARCGIS_SERVICES

    def build(self, configuration):
        self.configuration = configuration

        if self.test_layer is not None:
            crate_infos, errors = update_app_database.get_crate_infos(self.deqquerylayers, self.test_layer)
        else:
            crate_infos, errors = update_app_database.get_crate_infos(self.deqquerylayers)

        if len(errors) > 0:
            self.success = (False, '\n\n'.join(errors))

        self.add_crates([info for info in crate_infos if info[3] not in settings.PROBLEM_LAYERS])

        self.problem_layer_infos = [info for info in crate_infos if info[3] in settings.PROBLEM_LAYERS]

    def validate_crate(self, crate):
        return update_fgdb.validate_crate(crate)

    def requires_processing(self):
        #: make sure that update_problem_layers, and relationship classes are recreated is called every time
        return True

    def process(self):
        self.update_problem_layers()

        for crate in self.get_crates():
            if crate.was_updated():
                self.log.info('post processing crate: %s', crate.destination_name)
                update_fgdb.post_process_dataset(crate.destination)

    def update_problem_layers(self):
        for source_name, source_workspace, destination_workspace, destination_name in self.problem_layer_infos:
            if self.test_layer and self.test_layer.split('.')[-1] != destination_name:
                continue
            try:
                crate = Crate(source_name, source_workspace, destination_workspace, destination_name)
                source = path.join(source_workspace, source_name)
                destination = path.join(destination_workspace, destination_name)
                if not arcpy.Exists(destination):
                    self.log.info('creating %s', destination)
                    arcpy.Copy_management(source, destination)
                    crate.result = (Crate.CREATED, None)
                else:
                    self.log.info('manually updating %s', destination)
                    arcpy.DeleteRows_management(destination)
                    arcpy.Append_management(source, destination, 'TEST')
                    crate.result = (Crate.UPDATED, None)
            except Exception as ex:
                self.log.error('error manually updating %s!', destination)
                crate.result = (Crate.UNHANDLED_EXCEPTION, ex)

            self._crates.append(crate)

    def ship(self):
        update_sgid.update_sgid_for_crates(self.slip['crates'])


class DEQNightly2TempTablesPallet(Pallet):
    #: this is for source tables -> point feature classes
    #: it first copies the tables to a temp gdb
    #: then it etl's them directly into the app database
    #: the corresponding SGID data is updated in the ship method
    def __init__(self, test_layer=None):
        super(DEQNightly2TempTablesPallet, self).__init__()

        self.deqquerylayers = path.join(self.staging_rack, settings.fgd)
        self.deqquerylayers_temp = path.join(self.staging_rack, settings.fgd.replace('.gdb', '_temp.gdb'))
        self.copy_data = [self.deqquerylayers]
        self.arcgis_services = ARCGIS_SERVICES
        self.updated_datasets = []

        self.problem_layer_infos = []

        self.test_layer = test_layer

    def build(self, target):
        crate_infos, errors = update_app_database.get_temp_crate_infos(self.deqquerylayers_temp, self.test_layer)
        self.add_crates(crate_infos)

        if len(errors) > 0:
            self.success = (False, '\n\n'.join(errors))

    def process(self):
        self.log.info('ETL-ing temp tables to points in app database...')
        self.updated_datasets = update_app_database.start_etl(self.get_crates(), self.deqquerylayers)

        for crate in [crate for crate in self.get_crates() if crate.was_updated()]:
            update_fgdb.post_process_dataset(path.join(self.deqquerylayers, crate.destination_name))

    def ship(self):
        for spreadsheet_config, crate in get_spreadsheet_configs_for_crates(self.slip['crates']):
            sgid_name = spreadsheet_config[settings.fieldnames.sgidName]
            if sgid_name.casefold().startswith('sgid'):
                source = path.join(self.deqquerylayers, sgid_name.split('.')[-1])
                destination = path.join(settings.sgid[sgid_name.split('.')[1]], sgid_name)
                owner_connection = settings.sgid[sgid_name.split('.')[1]]

                self.log.info(f'updating {destination}')
                update_sgid.update_sgid_data(source, destination, owner_connection)


class DEQNightly3NonSGIDPallet(Pallet):
    #: this is for data that is not updated in SGID except for tables that need to be ETL'ed, those are
    #: taken care of in DEQNightly1TempTablesPallet
    def __init__(self, test_layer=None):
        super(DEQNightly3NonSGIDPallet, self).__init__()

        self.deqquerylayers = path.join(self.staging_rack, settings.fgd)
        self.copy_data = [self.deqquerylayers]
        self.arcgis_services = ARCGIS_SERVICES

        self.test_layer = test_layer

    def build(self, target):
        crate_infos, errors = update_app_database.get_non_sgid_crate_infos(self.deqquerylayers, self.test_layer)
        self.add_crates(crate_infos)

        if len(errors) > 0:
            self.success = (False, '\n\n'.join(errors))

    def validate_crate(self, crate):
        return update_fgdb.validate_crate(crate)

    def process(self):
        for crate in [crate for crate in self.get_crates() if crate.was_updated()]:
            update_fgdb.post_process_dataset(path.join(self.deqquerylayers, crate.destination_name))


class DEQNightly4RelatedTablesPallet(Pallet):
    def __init__(self, test_layer=None):
        super(DEQNightly4RelatedTablesPallet, self).__init__()

        self.test_layer = test_layer

        self.deqquerylayers = path.join(self.staging_rack, settings.fgd)
        self.copy_data = [self.deqquerylayers]
        self.arcgis_services = ARCGIS_SERVICES

    def build(self, configuration):
        self.configuration = configuration

        if self.test_layer is not None:
            crate_infos, errors = update_app_database.get_related_table_crate_infos(self.deqquerylayers,
                                                                                    self.test_layer)
        else:
            crate_infos, errors = update_app_database.get_related_table_crate_infos(self.deqquerylayers)

        if len(errors) > 0:
            self.success = (False, '\n\n'.join(errors))

        self.add_crates(crate_infos)

    def validate_crate(self, crate):
        return update_fgdb.validate_crate(crate)

    def ship(self):
        update_sgid.update_sgid_for_crates(self.slip['crates'])


class DEQNightly5ReferenceDataPallet(Pallet):
    def __init__(self, test_layer=None):
        super(DEQNightly5ReferenceDataPallet, self).__init__()

        self.test_layer = test_layer

        self.sgid = path.join(self.garage, 'SGID.sde')
        self.boundaries = path.join(self.staging_rack, 'boundaries.gdb')
        self.water = path.join(self.staging_rack, 'water.gdb')
        self.environment = path.join(self.staging_rack, 'environment.gdb')
        self.deqquerylayers = path.join(self.staging_rack, settings.fgd)
        self.search_streams = path.join(self.deqquerylayers, 'SearchStreams')

        self.copy_data = [self.boundaries,
                          self.water,
                          self.environment,
                          self.deqquerylayers]
        self.arcgis_services = ARCGIS_SERVICES

        self.static_data = [path.join(r'C:\Scheduled\static', 'deqreferencedata.gdb')]

    def build(self, target):
        if self.test_layer:
            return

        self.add_crate(('Counties', self.sgid, self.boundaries))
        self.add_crates(['HUC', STREAMS], {
            'source_workspace': self.sgid,
            'destination_workspace': self.water
        })
        self.add_crate(('ICBUFFERZONES', self.sgid, self.environment))

    def requires_processing(self):
        return not arcpy.Exists(self.search_streams) or super(DEQNightly5ReferenceDataPallet, self).requires_processing()

    def process(self):
        for crate in self.get_crates():
            if crate.destination_name == STREAMS:
                if crate.was_updated() or not arcpy.Exists(self.search_streams):
                    self.log.info('post processing streams data')

                    scratch = arcpy.env.scratchGDB
                    temp_field = 'TEMP'

                    #: temporary datasets
                    dissolved = path.join(scratch, 'DissolvedStreams')
                    identified = path.join(scratch, 'IdentifiedStreams')

                    #: layers
                    streams_layer = 'streams_layer'
                    no_name_layer = 'no_name_layer'

                    #: field names
                    GNIS_Name = fieldnames.GNIS_Name
                    NAME = fieldnames.NAME
                    COUNTY = fieldnames.COUNTY

                    #: clean up from last run, if needed
                    for cleanup_dataset in [dissolved, identified, self.search_streams]:
                        if arcpy.Exists(cleanup_dataset):
                            arcpy.Delete_management(cleanup_dataset)

                    query = '{0} IS NOT NULL AND {0} <> \'\''.format(GNIS_Name)
                    arcpy.MakeFeatureLayer_management(crate.destination, streams_layer, query)
                    arcpy.Dissolve_management(streams_layer,
                                              dissolved,
                                              dissolve_field=GNIS_Name,
                                              unsplit_lines='UNSPLIT_LINES')
                    arcpy.Identity_analysis(dissolved, path.join(self.boundaries, 'Counties'), identified)
                    arcpy.AddField_management(identified, temp_field, 'TEXT', '', '', 50)
                    arcpy.CalculateField_management(identified,
                                                    temp_field,
                                                    '!{}! + !{}!'.format(GNIS_Name, NAME),
                                                    'PYTHON')
                    arcpy.MakeFeatureLayer_management(identified,
                                                      no_name_layer,
                                                      '{0} IS NOT NULL AND {0} <> \'\''.format(NAME))
                    arcpy.Dissolve_management(no_name_layer, self.search_streams, temp_field)
                    arcpy.JoinField_management(self.search_streams,
                                               temp_field, no_name_layer,
                                               temp_field,
                                               [GNIS_Name, NAME])
                    arcpy.AddField_management(self.search_streams, COUNTY, 'TEXT', '', '', 25)
                    arcpy.CalculateField_management(self.search_streams, COUNTY, '!{}!'.format(NAME), 'PYTHON')
                    arcpy.DeleteField_management(self.search_streams, NAME)
                    arcpy.DeleteField_management(self.search_streams, temp_field)

                    for delete_layer in [streams_layer, no_name_layer]:
                        arcpy.Delete_management(delete_layer)

                    break


class DEQNightly6CreateRelationshipClassesPallet(Pallet):
    def __init__(self, test_layer=None):
        super(DEQNightly6CreateRelationshipClassesPallet, self).__init__()

    def requires_processing(self):
        return True

    def process(self):
        """
        Create relationship classes after edits are made.
        Otherwise, when parent features are deleted by the forklift update
        process, the foreign key values in the child records are set to null and
        forklift has no idea since the value of FORKLIFT_HASH is unchanged.
        """
        update_fgdb.create_relationship_classes(self.staging_rack)
