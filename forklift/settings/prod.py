from .stage import *

# overrides for production environment
sgid = {'ENVIRONMENT': os.path.join(dbConnects, 'SGID as ENVIRONMENT on prod.sde'),
        'WATER': os.path.join(dbConnects, 'SGID as WATER on prod.sde'),
        'ENERGY': os.path.join(dbConnects, 'SGID as ENERGY on prod.sde')}
queryLayersUrl = 'https://docs.google.com/spreadsheets/d/1-HJViZduddtnxSq35yzhR6YU0U6Pwo0OaimXPHT4vPw/edit#gid=0'
utahddw_file_name = 'utahddw.sde'

sendEmails = True

reportEmail = ['mhorning@utah.gov']
