# copies data from SGID to the app and makes necessary optimizations

import arcpy
import settings
from settings import fieldnames
import spreadsheet
from os import path

fiveFields = [
              fieldnames.ID, 
              fieldnames.NAME, 
              fieldnames.ADDRESS, 
              fieldnames.CITY, 
              fieldnames.TYPE
              ]
logger = None
errors = []

def run(logr):
    global logger, errors
    logger = logr
    
    logger.logMsg('processing query layers')
    update_query_layers()
    
    logger.logMsg('processing related tables')
    update_related_tables()
    
    return errors
    
def update_related_tables():
    for t in spreadsheet.get_related_tables():
        name = t[fieldnames.sgidName]
        try:
            if name.startswith('SGID10'):
                logger.logMsg('Processing: {}'.format(name.split('.')[-1]))
                localTbl = path.join(settings.fgd, name.split('.')[-1])
                remoteTbl = path.join(settings.sgid, name)
                update(localTbl, remoteTbl)
        except:
            errors.append('Execution error trying to update fgdb with {}:\n{}'.format(name, logger.logError()))
    
def update(local, remote):
    logger.logMsg('\n\nupdating: {} \n    from: {}'.format(local, remote))
    if not arcpy.Exists(local):
        logger.logMsg('creating new local feature class')
        arcpy.Copy_management(remote, local)
    else:
        arcpy.TruncateTable_management(local)
        arcpy.Append_management(remote, local, 'NO_TEST')
        
def update_query_layers():
    for l in spreadsheet.get_query_layers():
        fcname = l[fieldnames.sgidName]
        try:
            # only try to update rows with valid sgid names and data sources
            if fcname.startswith('SGID10'):
                # update fgd from SGID
                logger.logMsg('Processing: {}'.format(fcname.split('.')[-1]))
                localFc = path.join(settings.fgd, fcname.split('.')[-1])
                remoteFc = path.join(settings.sgid, fcname)
                update(localFc, remoteFc)
                
                # APP-SPECIFIC OPTIMIZATIONS
                # make sure that it has the five main fields for the fdg only
                upper_fields = [x.name.upper() for x in arcpy.ListFields(localFc)]      
                for f in fiveFields:
                    if not f in upper_fields:
                        logger.logMsg('{} not found. Adding to {}'.format(f, localFc))
                        arcpy.AddField_management(localFc, f, 'TEXT', 0, 0, 500)
                
                    # calc field
                    expression = l[f]
                    if not expression == 'n/a':
                        expression = '!{}!'.format(expression)
                    else:
                        expression = '"{}"'.format(expression)
                    arcpy.CalculateField_management(localFc, f, expression, 'PYTHON')    
        except:
            errors.append('Execution error trying to update fgdb with {}:\n{}'.format(fcname, logger.logError().strip()))

if __name__ == '__main__':
    from agrc import logging
    logger = logging.Logger()
    run(logger)
    print('done')