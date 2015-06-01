from stage import *

# overrides for production environment
sgid = {'ENVIRONMENT': os.path.join(dbConnects, 'SGID10 as ENVIRONMENT on prod.sde'),
    'WATER': os.path.join(dbConnects, 'SGID10 as WATER on prod.sde'),
    'ENERGY': os.path.join(dbConnects, 'SGID10 as ENERGY on prod.sde')}
updateFTP = True
queryLayersUrl = 'https://docs.google.com/spreadsheets/d/1-HJViZduddtnxSq35yzhR6YU0U6Pwo0OaimXPHT4vPw/edit#gid=0'
sendEmails = True
