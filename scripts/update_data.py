import arcpy
import os
import build_json

current_folder = os.path.dirname(__file__)
sgid = os.path.join(current_folder, 'SGID10.sde')
fgd = r'C:\MapData\DEQEnviro\QueryLayers.gdb'
fiveFields = [build_json.fldID, build_json.fldNAME, build_json.fldADDRESS, build_json.fldCITY, build_json.fldTYPE]

def add_field(fc, fld, copyField):
    arcpy.AddField_management(fc, fld, 'TEXT', 0, 0, 150)
    expression = copyField
    if not expression == 'n/a':
        expression = '!{}!'.format(expression)
    else:
        expression = '"{}"'.format(expression)
    arcpy.CalculateField_management(fc, fld, expression, 'PYTHON')

def run(query_layers, logger):
    for l in query_layers:
        workspace = l[build_json.workspace]
        if workspace != '':
            fcname = l[build_json.fcName]
            logger.logMsg('Processing: {}'.format(fcname.split('.')[-1]))
            localFc = os.path.join(fgd, fcname.split('.')[-1])
            remoteFc = os.path.join(workspace, fcname)
            if not arcpy.Exists(localFc):
                logger.logMsg('creating new local feature class')
                arcpy.Copy_management(remoteFc, localFc)
            else:
                pass
                # TODO: if exists then update data
            
            # make sure that it has the five main fields
            fields = [x.name for x in arcpy.ListFields(localFc)]      
            for f in fiveFields:
                if not f in fields:
                    logger.logMsg('{} not found. Adding to {}'.format(f, localFc))
                    add_field(localFc, f, l[f])
                    
                    