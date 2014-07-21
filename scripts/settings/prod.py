from dev import *

# overrides for production environment
webdata = r'C:\MapData\webdata' # specific to .57
sgid = os.path.join(dbConnects, 'SGID10 as ENVIRONMENT on prod.sde')

sendEmails = True