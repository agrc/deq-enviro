from .dev import *

# overrides for stage environment
sgid = {'ENVIRONMENT': os.path.join(dbConnects, 'SGID as ENVIRONMENT on stage.sde'),
        'WATER': os.path.join(dbConnects, 'SGID as WATER on stage.sde'),
        'ENERGY': os.path.join(dbConnects, 'SGID as ENERGY on stage.sde')}
