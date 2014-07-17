from dev import *

# overrides for production environment
webdata = r'\\172.16.17.57\ArcGISServer\data\webdata' # production
sgid = os.path.join(dbConnects, 'SGID10 as ENVIRONMENT on prod.sde')