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

current_folder = path.dirname(path.realpath(__file__))
STREAMS = 'StreamsNHDHighRes'


class DEQNightly1UpdatePallet(Pallet):
    #: this is for all non-etl data updates to the app database
    #: the corresponding SGID data is updated in the ship method
    def __init__(self, test_layer=None):
        super(DEQNightly1UpdatePallet, self).__init__()

        self.problem_layer_infos = []

        self.test_layer = test_layer

        self.deqquerylayers = path.join(self.staging_rack, settings.fgd)

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


class DEQNightly4RelatedTablesPallet(Pallet):
    def __init__(self, test_layer=None):
        super(DEQNightly4RelatedTablesPallet, self).__init__()

        self.test_layer = test_layer

        self.deqquerylayers = path.join(self.staging_rack, settings.fgd)

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

