# prod overrides this module
import os

# URLS
agsServer = 'localhost'
configSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1aVJ68hOyp4H6sKEEuL-xtB2qE_y6W0gDg35TgUSxtFg/edit#gid=0'

# database connections
dbConnects = os.path.join(os.path.dirname(os.path.abspath(__file__)), r'..\databases')
sgid = {'ENVIRONMENT': os.path.join(dbConnects, 'SGID as ENVIRONMENT on local.sde'),
        'WATER': os.path.join(dbConnects, 'SGID as WATER on local.sde'),
        'ENERGY': os.path.join(dbConnects, 'SGID as ENERGY on local.sde')}
utahddw_file_name = 'utahddw_at.sde'

fgd = 'deqquerylayers.gdb'

sendEmails = False

reportEmail = 'stdavis@utah.gov'

#: these layers cause issues for forklift so they are skipped and manually updated within the pallet
PROBLEM_LAYERS = ['DEQMAP_EIChemical']
