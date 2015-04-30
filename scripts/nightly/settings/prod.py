from stage import *

# overrides for production environment
sgid = {'ENVIRONMENT': os.path.join(dbConnects, 'SGID10 as ENVIRONMENT on prod.sde'),
    'WATER': os.path.join(dbConnects, 'SGID10 as WATER on prod.sde'),
    'ENERGY': os.path.join(dbConnects, 'SGID10 as ENERGY on prod.sde')}
updateFTP = True
queryLayersUrl = 'https://docs.google.com/a/utah.gov/spreadsheet/ccc?key=0Aqee4VOgQcXcdG9DQzFEYld6UUtWRU1kNG5PMWVEY1E&usp=drive_web#gid=0'
sendEmails = True
