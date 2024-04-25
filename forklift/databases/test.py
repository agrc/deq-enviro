import arcpy, os

db = os.path.join(os.path.dirname(os.path.abspath(__file__)), r'eqedocsp.sde\AGRC.VW_DSHW_FACILITY')

if arcpy.Exists(db):
    print('pass')
else:
    print('fail')
    