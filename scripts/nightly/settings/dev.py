# prod overrides this module
import os

# URLS
queryLayersUrl = 'https://docs.google.com/spreadsheets/d/1aVJ68hOyp4H6sKEEuL-xtB2qE_y6W0gDg35TgUSxtFg/edit#gid=0'
mapServiceJson = 'http://localhost/arcgis/rest/services/DEQEnviro/MapService/MapServer?f=json'
securedServiceJson = 'http://localhost/arcgis/rest/services/DEQEnviro/Secure/MapServer?f=json'
webdata = r'X:\Projects\deq-enviro\src\webdata'
agsServer = 'localhost'

# database connections
dbConnects = os.path.join(os.path.dirname(os.path.abspath(__file__)), r'..\databases')
sgid = {'ENVIRONMENT': os.path.join(dbConnects, 'SGID10 as ENVIRONMENT on local.sde'),
        'WATER': os.path.join(dbConnects, 'SGID10 as WATER on local.sde'),
        'ENERGY': os.path.join(dbConnects, 'SGID10 as ENERGY on local.sde')}

fgd = 'deqquerylayers.gdb'

sendEmails = False
updateFTP = False

reportEmail = 'stdavis@utah.gov'

mapData1 = r'C:\MapData'
mapData2 = r'C:\MapData'

#: these layers cause issues for forklift so they are skipped and manually updated within the pallet
PROBLEM_LAYERS = ['DEQMAP_EIChemical']
