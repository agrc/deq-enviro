# prod overrides this module
import os

# URLS
queryLayersUrl = 'https://docs.google.com/spreadsheets/d/1aVJ68hOyp4H6sKEEuL-xtB2qE_y6W0gDg35TgUSxtFg/edit#gid=0'
mapServiceJson = 'http://localhost/arcgis/rest/services/DEQEnviro/MapService/MapServer?f=json'
securedServiceJson = 'http://localhost/arcgis/rest/services/DEQEnviro/Secure/MapServer?f=json'
webdata = r'C:\inetpub\wwwroot\deqenviro\webdata'
agsServer = 'localhost'

# database connections
dbConnects = os.path.join(os.path.dirname(os.path.abspath(__file__)), r'..\databases')
sgid = {'ENVIRONMENT': os.path.join(dbConnects, 'SGID10 as ENVIRONMENT on stage.sde'),
        'WATER': os.path.join(dbConnects, 'SGID10 as WATER on stage.sde'),
        'ENERGY': os.path.join(dbConnects, 'SGID10 as ENERGY on stage.sde')}

fgd = r'C:\Scheduled\staging\deqquerylayers.gdb'
reference = r'C:\Scheduled\staging\deqreferencedata.gdb'
tempPointsGDB = r'C:\Scheduled\staging\DEQEnviro\TempPoints.gdb'

sendEmails = False
updateFTP = False

reportEmail = 'stdavis@utah.gov'
