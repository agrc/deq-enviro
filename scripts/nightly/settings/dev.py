# prod overrides this module
import os

# URLS
queryLayersUrl = 'https://docs.google.com/a/utah.gov/spreadsheet/ccc?key=0Aqee4VOgQcXcdDBiTmo5X3pQdGdSYXYyNWZ1a2k0RVE#gid=0'
mapServiceJson = 'http://localhost/arcgis/rest/services/DEQEnviro/MapService/MapServer?f=json'
securedServiceJson = 'http://localhost/arcgis/rest/services/DEQEnviro/Secure/MapServer?f=json'
webdata = r'Z:\Documents\Projects\deq-enviro\src\webdata'
agsServer = 'localhost'

# database connections
dbConnects = os.path.join(os.path.dirname(os.path.abspath(__file__)), r'..\databases')
sgid = {'ENVIRONMENT': os.path.join(dbConnects, 'SGID10 as ENVIRONMENT on local.sde'),
    'WATER': os.path.join(dbConnects, 'SGID10 as WATER on local.sde'),
    'ENERGY': os.path.join(dbConnects, 'SGID10 as ENERGY on local.sde')}

fgd = r'C:\MapData\DEQEnviro\QueryLayers.gdb'

sendEmails = False
updateFTP = False
