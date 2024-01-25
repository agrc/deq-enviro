# copies data from SGID to the app and makes necessary optimizations

import logging
import re
from collections import namedtuple
from os import path

import arcpy
import settings
import spreadsheet
from build_json import parse_fields
from forklift.exceptions import ValidationException
from settings import fieldnames


commonFields = [fieldnames.ID,
                fieldnames.NAME,
                fieldnames.ADDRESS,
                fieldnames.CITY,
                fieldnames.TYPE,
                fieldnames.ENVIROAPPLABEL,
                fieldnames.ENVIROAPPSYMBOL]
logger = logging.getLogger('forklift')
field_type_mappings = {'Integer': 'LONG',
                       'String': 'TEXT',
                       'SmallInteger': 'SHORT'}


def clip_to_state_boundary(dataset):
    logger.info('Clipping %s to state boundary', dataset)
    state = arcpy.management.MakeFeatureLayer('https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/UtahStateBoundary/FeatureServer/0', 'state', where_clause='STATE = \'UTAH\'')
    dataset = arcpy.management.MakeFeatureLayer(dataset, 'dataset')
    arcpy.management.SelectLayerByLocation(dataset, overlap_type='INTERSECT', select_features=state)
    arcpy.management.SelectLayerByLocation(dataset, selection_type='SWITCH_SELECTION')
    arcpy.management.DeleteFeatures(dataset)
    arcpy.management.Delete(state)
    arcpy.management.Delete(dataset)

def post_process_dataset(dataset):
    config = get_spreadsheet_config_from_dataset(dataset)

    if config[settings.fieldnames.etlType] == 'state_boundary':
        clip_to_state_boundary(dataset)

    if commonFields[0] in list(config.keys()):
        #: make sure that it has the five main fields
        upper_fields = [x.name.upper() for x in arcpy.ListFields(dataset)]
        for fld in commonFields:
            if fld not in upper_fields:
                logger.info('{} not found. Adding to {}'.format(fld, dataset))

                # get mapped field properties
                if not config[fld] == 'n/a':
                    try:
                        mappedFld = arcpy.ListFields(dataset, config[fld])[0]
                    except IndexError:
                        raise Exception('Could not find {} in {}'.format(config[fld], path.basename(dataset)))
                else:
                    mappedFld = namedtuple('literal', 'precision scale length type')(**{'precision': 0,
                                                                                        'scale': 0,
                                                                                        'length': 50,
                                                                                        'type': 'String'})
                arcpy.AddField_management(dataset, fld, 'TEXT', field_length=255)

                if fld == fieldnames.ID:
                    unique = 'UNIQUE'
                else:
                    unique = 'NON_UNIQUE'
                arcpy.AddIndex_management(dataset, fld, fld + '_index', unique)

            # calc field
            expression = config[fld]
            uses_layer = False
            if not expression == 'n/a':
                try:
                    mappedFld = arcpy.ListFields(dataset, config[fld])[0]
                except IndexError:
                    raise Exception('Could not find {} in {}'.format(config[fld], path.basename(dataset)))

                if mappedFld.type != 'String':
                    expression = 'str(int(!{}!))'.format(expression)
                else:
                    expression = '!{}!'.format(expression)
                calc_layer = arcpy.management.MakeFeatureLayer(dataset,
                                                               'calc-layer',
                                                               '{} IS NOT NULL'.format(config[fld]))
                uses_layer = True
            else:
                calc_layer = dataset
                expression = '"{}"'.format(expression)
            arcpy.CalculateField_management(calc_layer, fld, expression, 'PYTHON')

            if uses_layer:
                arcpy.management.Delete(calc_layer)

        apply_coded_values(dataset, config[fieldnames.codedValues])

        # scrub out any empty geometries or empty ID's
        #: note: arcpy.DeleteFeature_management(lyr) was leaving a weird schema lock even after deleting the layer

        #: a bug in Pro 2.5.1 prevents this line from running, but will supposedly be fixed in 2.6
        # arcpy.RepairGeometry_management(dataset)
        with arcpy.da.Editor(path.dirname(dataset)):
            with arcpy.da.UpdateCursor(dataset, 'OID@', '{} IS NULL'.format(fieldnames.ID)) as ucur:
                for _ in ucur:
                    ucur.deleteRow()


def delete_relationship_classes(staging):
    logger.info('deleting relationship classes')
    for config in spreadsheet.get_relationship_classes():
        rcName = config[fieldnames.relationshipName]
        rcPath = path.join(staging, settings.fgd, rcName)

        if arcpy.Exists(rcPath):
            logger.debug(f'deleting {rcName}')
            arcpy.Delete_management(rcPath)


def create_relationship_classes(staging):
    for config in spreadsheet.get_relationship_classes():
        # create relationship class if missing
        rcName = config[fieldnames.relationshipName]
        rcPath = path.join(staging, settings.fgd, rcName)

        origin = path.join(staging, settings.fgd, config[fieldnames.parentDatasetName])
        destination = path.join(staging, settings.fgd, config[fieldnames.relatedTableName])
        if not arcpy.Exists(rcPath) and arcpy.Exists(origin) and arcpy.Exists(destination):
            logger.info(f'Creating {rcName}')
            arcpy.CreateRelationshipClass_management(origin,
                                                     destination,
                                                     rcPath,
                                                     'SIMPLE',
                                                     config[fieldnames.relatedTableName],
                                                     config[fieldnames.parentDatasetName],
                                                     'BOTH',
                                                     'ONE_TO_MANY',
                                                     'NONE',
                                                     config[fieldnames.primaryKey],
                                                     config[fieldnames.foreignKey])


def get_spreadsheet_config_from_dataset(dataset):
    name = path.basename(dataset)
    for config in spreadsheet.get_query_layers() + spreadsheet.get_related_tables():
        if config[fieldnames.sgidName].split('.')[-1] == name:
            return config

    raise Exception('{} not found in spreadsheet!'.format(name))


def validate_crate(crate):
    dataFields = [f.name for f in arcpy.ListFields(crate.source)]
    config = get_spreadsheet_config_from_dataset(crate.destination)

    msg = '{}: Could not find matches in the source data for the following fields from the query layers spreadsheet: {}'
    dataFields = set(dataFields)
    try:
        additionalFields = [config[f] for f in commonFields]
    except Exception:
        #: related tables don't have the additional fields
        additionalFields = []
    spreadsheetFields = set([f[0] for f in parse_fields(config[fieldnames.fields])] + additionalFields) - set(['n/a'])

    invalidFields = spreadsheetFields - dataFields - set(commonFields)

    if len(invalidFields) > 0:
        raise ValidationException(msg.format(crate.destination_name, ', '.join(invalidFields)))

    return True


def apply_coded_values(fc, codedValuesTxt):
    if len(codedValuesTxt.strip()) == 0:
        return

    for valuesForField in codedValuesTxt.split(';'):
        field_name = re.search(r'(^\S*)\:', valuesForField).group(1)
        codes = re.findall(r'(\S*) \(.*?\),?', valuesForField)
        descriptions = re.findall(r'\S* \((.*?)\),?', valuesForField)

        logger.info('applying coded values for {} field'.format(field_name))

        layer = arcpy.MakeFeatureLayer_management(fc)
        for code, desc in zip(codes, descriptions):
            where = '{} = \'{}\''.format(field_name, code)
            arcpy.SelectLayerByAttribute_management(layer, where_clause=where)
            arcpy.CalculateField_management(fc, field_name, '"{}"'.format(desc), 'PYTHON')

        arcpy.Delete_management(layer)
