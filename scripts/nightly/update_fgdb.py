# copies data from SGID to the app and makes necessary optimizations

import arcpy
import settings
from settings import fieldnames
import spreadsheet
from os import path
from build_json import parse_fields
from collections import namedtuple

fiveFields = [
              fieldnames.ID, 
              fieldnames.NAME, 
              fieldnames.ADDRESS, 
              fieldnames.CITY, 
              fieldnames.TYPE,
              fieldnames.ENVIROAPPLABEL
              ]
logger = None
errors = []
field_type_mappings = {'Integer': 'LONG',
                       'String': 'TEXT',
                       'SmallInteger': 'SHORT'}

def run(logr, test_layer=None):
    global logger, errors
    logger = logr
    
    logger.logMsg('processing query layers\n')
    update_query_layers(test_layer)
    
    logger.logMsg('processing related tables\n')
    update_related_tables(test_layer)
    
    return errors
    
def update_related_tables(test_layer=None):
    for t in spreadsheet.get_related_tables():
        name = t[fieldnames.sgidName]
        if test_layer and name != test_layer:
            continue
        try:
            if name.startswith('SGID10'):
                logger.logMsg('\nProcessing: {}'.format(name.split('.')[-1]))
                localTbl = path.join(settings.fgd, name.split('.')[-1])
                remoteTbl = path.join(settings.sgid[name.split('.')[1]], name)
                update(localTbl, remoteTbl)
                validate_fields([f.name for f in arcpy.ListFields(localTbl)], t[fieldnames.fields], name)
        except:
            errors.append('Execution error trying to update fgdb with {}:\n{}'.format(name, logger.logError()))
    
def update(local, remote):
    logger.logMsg('updating: {} \n    from: {}'.format(local, remote))
    if not arcpy.Exists(local):
        logger.logMsg('creating new local feature class')
        arcpy.Copy_management(remote, local)
    else:
        arcpy.TruncateTable_management(local)
        try:
            arcpy.Append_management(remote, local, 'NO_TEST')
        except:
            with arcpy.da.Editor(settings.fgd) as edit:
                logger.logMsg('append failed, using insert cursor')
                flds = [f.name for f in arcpy.ListFields(remote)]
                with arcpy.da.SearchCursor(remote, flds) as rcur, arcpy.da.InsertCursor(local, flds) as icur:
                    for row in rcur:
                        icur.insertRow(row)
        
def update_query_layers(test_layer=None):
    for l in spreadsheet.get_query_layers():
        fcname = l[fieldnames.sgidName]
        if test_layer and fcname != test_layer:
            continue
        try:
            if fcname.startswith('SGID10') or fcname.startswith('DirectFromSource'):
                # update fgd from SGID
                logger.logMsg('\nProcessing: {}'.format(fcname.split('.')[-1]))
                localFc = path.join(settings.fgd, fcname.split('.')[-1])
                if fcname.startswith('SGID10'):
                    remoteFc = path.join(settings.sgid[fcname.split('.')[1]], fcname)
                else:
                    remoteFc = l[fieldnames.sourceData]
                update(localFc, remoteFc)
                
                # APP-SPECIFIC OPTIMIZATIONS
                # make sure that it has the five main fields for the fdg only
                upper_fields = [x.name.upper() for x in arcpy.ListFields(localFc)]      
                for f in fiveFields:
                    if not f in upper_fields:
                        logger.logMsg('{} not found. Adding to {}'.format(f, localFc))

                        # get mapped field properties
                        if not l[f] == 'n/a':
                            mappedFld = arcpy.ListFields(localFc, l[f])[0]
                        else:
                            mappedFld = namedtuple('literal', 'precision scale length')(**{'precision': 0,
                                                                                           'scale': 0,
                                                                                           'length': 3})

                        arcpy.AddField_management(localFc, f, 'String',
                                                  mappedFld.precision, mappedFld.scale, mappedFld.length)
                
                    # calc field
                    expression = l[f]
                    if not expression == 'n/a':
                        if arcpy.ListFields(localFc, l[f])[0].type != 'String':
                            expression = 'str(!{}!)'.format(expression)
                        else:
                            expression = '(!{}!.encode("utf-8"))'.format(expression)
                    else:
                        expression = '"{}"'.format(expression)
                    arcpy.CalculateField_management(localFc, f, expression, 'PYTHON')
                
                validate_fields([f.name for f in arcpy.ListFields(localFc)], l[fieldnames.fields], fcname)  
        except:
            errors.append('Execution error trying to update fgdb with {}:\n{}'.format(fcname, logger.logError().strip()))

def validate_fields(dataFields, fieldString, datasetName):
    msg = '{}: Could not find matches in the source data for the following fields from the query layers spreadsheet: {}'
    dataFields = set(dataFields)
    spreadsheetFields = set([f[0] for f in parse_fields(fieldString)])
    
    invalidFields = spreadsheetFields - dataFields
    
    if len(invalidFields) > 0:
        er = msg.format(datasetName, ', '.join(invalidFields))
        errors.append(er)
        return er
    else:
        return []

if __name__ == '__main__':
    from agrc import logging
    import sys

    logger = logging.Logger()

    # first argument is optionally the SGID feature class or table name
    if len(sys.argv) == 2:
        run(logger, sys.argv[1])
    else:
        run(logger)
    print('done')