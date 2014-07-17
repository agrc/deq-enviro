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

def run(logger):
    for l in spreadsheet.get_query_layers():
        fcname = l[fieldnames.sgidName]
        # only try to update rows with valid sgid names and data sources
        if fcname.startswith('SGID10.ENVIRONMENT'):
            # update fgd from SGID
            logger.logMsg('Processing: {}'.format(fcname.split('.')[-1]))
            localFc = path.join(settings.fgd, fcname.split('.')[-1])
            remoteFc = path.join(settings.sgid, fcname)
            if not arcpy.Exists(localFc):
                logger.logMsg('creating new local feature class')
                arcpy.Copy_management(remoteFc, localFc)
            else:
                pass
                arcpy.TruncateTable_management(localFc)
                arcpy.Append_management(remoteFc, localFc, 'NO_TEST')
            
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
                    

if __name__ == '__main__':
    from agrc import logging
    logger = logging.Logger()
    run(logger)
    print('done')