from .stage import *

# overrides for production environment
sgid = {'ENVIRONMENT': os.path.join(dbConnects, 'SGID10 as ENVIRONMENT on prod.sde'),
        'WATER': os.path.join(dbConnects, 'SGID10 as WATER on prod.sde'),
        'ENERGY': os.path.join(dbConnects, 'SGID10 as ENERGY on prod.sde')}
queryLayersUrl = 'https://docs.google.com/spreadsheets/d/1-HJViZduddtnxSq35yzhR6YU0U6Pwo0OaimXPHT4vPw/edit#gid=0'

agsServer = '172.16.17.53'
mapServiceJson = 'http://172.16.17.53:6080/arcgis/rest/services/DEQEnviro/MapService/MapServer?f=json'
securedServiceJson = 'http://172.16.17.53:6080/arcgis/rest/services/DEQEnviro/Secure/MapServer?f=json'
sendEmails = True

reportEmail = ['haroldsandbeck@utah.gov', 'mhorning@utah.gov']

webdata = r'\\172.16.77.69\c$\inetpub\wwwroot\deqenviro\webdata'
mapData1 = r'\\172.16.17.53\c$\MapData'
mapData2 = r'\\172.16.17.54\c$\MapData'
