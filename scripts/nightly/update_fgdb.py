# copies data from SGID to the app and makes necessary optimizations

import arcpy
import logging
import re
import settings
import spreadsheet
from build_json import parse_fields
from collections import namedtuple
from forklift.exceptions import ValidationException
from os import path
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


def get_crate_infos(staging, test_layer=None):
    infos = []
    for dataset in spreadsheet.get_datasets():
        #: skip if using test_layer and it's not the current layer
        if test_layer and dataset[fieldnames.sgidName] != test_layer:
            continue

        sgidName = dataset[fieldnames.sgidName]
        sourceData = dataset[fieldnames.sourceData]

        if sgidName.startswith('DirectFrom.Source'):
            #: gdb or sde
            if len(sourceData.split('.gdb')) > 1:
                dbtype = '.gdb'
            else:
                dbtype = '.sde'
            source_workspace = path.join(settings.dbConnects, sourceData.split(dbtype)[0]) + dbtype
            source_name = sourceData.split(dbtype)[1].lstrip('\\')
        else:
            source_workspace = settings.sgid[sgidName.split('.')[1]]
            source_name = sgidName

        infos.append((source_name, source_workspace, path.join(staging, settings.fgd), sgidName.split('.')[2]))

    return infos


def post_process_crate(crate):
    config = get_spreadsheet_config_from_crate(crate)
    if commonFields[0] in config.keys():
        #: make sure that it has the five main fields
        upper_fields = [x.name.upper() for x in arcpy.ListFields(crate.destination)]
        for fld in commonFields:
            if fld not in upper_fields:
                logger.info('{} not found. Adding to {}'.format(fld, crate.destination))

                # get mapped field properties
                if not config[fld] == 'n/a':
                    try:
                        mappedFld = arcpy.ListFields(crate.destination, config[fld])[0]
                    except IndexError:
                        raise Exception('Could not find {} in {}'.format(config[fld], crate.destination_name))
                else:
                    mappedFld = namedtuple('literal', 'precision scale length type')(**{'precision': 0,
                                                                                        'scale': 0,
                                                                                        'length': 50,
                                                                                        'type': 'String'})
                arcpy.AddField_management(crate.destination, fld, 'TEXT', field_length=255)

            # calc field
            expression = config[fld]
            if not expression == 'n/a':
                try:
                    mappedFld = arcpy.ListFields(crate.destination, config[fld])[0]
                except IndexError:
                    raise Exception('Could not find {} in {}'.format(config[fld], crate.destination_name))

                if mappedFld.type != 'String':
                    expression = 'str(int(!{}!))'.format(expression)
                else:
                    expression = '!{}!.encode("utf-8")'.format(expression)
            else:
                expression = '"{}"'.format(expression)
            arcpy.CalculateField_management(crate.destination, fld, expression, 'PYTHON')

        apply_coded_values(crate.destination, config[fieldnames.codedValues])

        # scrub out any empty geometries or empty ID's
        arcpy.RepairGeometry_management(crate.destination)
        lyr = arcpy.MakeFeatureLayer_management(crate.destination, '{}_lyr'.format(crate.destination_name), '{} IS NULL'.format(fieldnames.ID))
        arcpy.DeleteFeatures_management(lyr)
        arcpy.Delete_management(lyr)


def create_relationship_classes(staging, test_layer):
    for config in spreadsheet.get_relationship_classes():
        # create relationship class if missing
        rcName = config[fieldnames.relationshipName]
        rcPath = path.join(staging, settings.fgd, rcName)
        if test_layer is not None and config[fieldnames.parentDatasetName] != test_layer.split('.')[-1]:
            continue

        if not arcpy.Exists(rcPath):
            origin = path.join(staging, settings.fgd, config[fieldnames.parentDatasetName])
            destination = path.join(staging, settings.fgd, config[fieldnames.relatedTableName])
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


def get_spreadsheet_config_from_crate(crate):
    for config in spreadsheet.get_datasets():
        if config[fieldnames.sgidName].split('.')[2] == crate.destination_name:
            return config

    raise Exception('{} not found in spreadsheet!'.format(crate.destination_name))


def validate_crate(crate):
    dataFields = [f.name for f in arcpy.ListFields(crate.source)]
    config = get_spreadsheet_config_from_crate(crate)

    msg = '{}: Could not find matches in the source data for the following fields from the query layers spreadsheet: {}'
    dataFields = set(dataFields)
    try:
        additionalFields = [config[f] for f in commonFields]
    except:
        #: related tables don't have the additional fields
        additionalFields = []
    spreadsheetFields = set([f[0] for f in parse_fields(config[fieldnames.fields])] + additionalFields) - set(['n/a'])

    invalidFields = spreadsheetFields - dataFields

    if len(invalidFields) > 0:
        raise ValidationException(msg.format(crate.destination_name, ', '.join(invalidFields)))

    return True


def apply_coded_values(fc, codedValuesTxt):
    if len(codedValuesTxt.strip()) == 0:
        return

    field_name = re.search(ur'(^\S*)\:', codedValuesTxt).group(1)
    codes = re.findall(ur'(\S*) \(.*?\),', codedValuesTxt)
    descriptions = re.findall(ur'\S* \((.*?)\),', codedValuesTxt)

    logger.info('applying coded values for {} field'.format(field_name))

    layer = arcpy.MakeFeatureLayer_management(fc)
    for code, desc in zip(codes, descriptions):
        arcpy.SelectLayerByAttribute_management(layer, where_clause='{} = \'{}\''.format(field_name, code))
        arcpy.CalculateField_management(fc, field_name, '"{}"'.format(desc), 'PYTHON')

    arcpy.Delete_management(layer)
