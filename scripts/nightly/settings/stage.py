from dev import *

# overrides for stage environment
webdata = r'C:\MapData\webdata' # specific to .57
sgid = {'ENVIRONMENT': os.path.join(dbConnects, 'SGID10 as ENVIRONMENT on stage.sde'),
    'WATER': os.path.join(dbConnects, 'SGID10 as WATER on stage.sde'),
    'ENERGY': os.path.join(dbConnects, 'SGID10 as ENERGY on stage.sde')}

sendEmails = True