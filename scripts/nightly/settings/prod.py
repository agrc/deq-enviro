from stage import *

# overrides for production environment
sgid = {'ENVIRONMENT': os.path.join(dbConnects, 'SGID10 as ENVIRONMENT on prod.sde'),
    'WATER': os.path.join(dbConnects, 'SGID10 as WATER on prod.sde'),
    'ENERGY': os.path.join(dbConnects, 'SGID10 as ENERGY on prod.sde')}
