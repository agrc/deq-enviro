from .dev import *

# overrides for stage environment
mapServiceJson = 'http://localhost:6080/arcgis/rest/services/DEQEnviro/MapService/MapServer?f=json'
securedServiceJson = 'http://localhost:6080/arcgis/rest/services/DEQEnviro/Secure/MapServer?f=json'
webdata = r'C:\inetpub\wwwroot\deqenviro\webdata'
sgid = {'ENVIRONMENT': os.path.join(dbConnects, 'SGID as ENVIRONMENT on stage.sde'),
        'WATER': os.path.join(dbConnects, 'SGID as WATER on stage.sde'),
        'ENERGY': os.path.join(dbConnects, 'SGID as ENERGY on stage.sde')}
