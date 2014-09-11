# prod overrides this module
import os

# URLS
queryLayersUrl = 'https://docs.google.com/a/utah.gov/spreadsheet/ccc?key=0Aqee4VOgQcXcdG9DQzFEYld6UUtWRU1kNG5PMWVEY1E&usp=drive_web#gid=0'
mapServiceJson = 'http://localhost/arcgis/rest/services/DEQEnviro/MapService/MapServer?f=json'
webdata = r'C:\MapData\webdata'

# database connections
dbConnects = os.path.join(os.path.dirname(os.path.abspath(__file__)), r'..\databases')
sgid = os.path.join(dbConnects, 'SGID10 as ENVIRONMENT on local.sde')

fgd = r'C:\MapData\DEQEnviro\QueryLayers.gdb'

sendEmails = False