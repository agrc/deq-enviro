import arcpy
import sys
from os.path import join

arcpy.env.geographicTransformations = 'NAD_1983_to_WGS_1984_5'

try:
    base_folder = sys.argv[1]
except:
    base_folder = raw_input('base folder: ')

print('creating new database')
new_db = base_folder + 'QueryLayers_NEW.gdb'
old_db = base_folder + 'QueryLayers.gdb'
new_ref_db = base_folder + 'ReferenceData.gdb'
old_ref_db = base_folder + 'ReferenceData_NEW.gdb'
if arcpy.Exists(new_db):
    arcpy.Delete_management(new_db)
arcpy.CreateFileGDB_management(base_folder, 'QueryLayers_NEW.gdb')
if arcpy.Exists(new_ref_db):
    arcpy.Delete_management(new_ref_db)
arcpy.CreateFileGDB_management(base_folder, 'ReferenceData_NEW.gdb')

relationship_class_names = set([])
arcpy.env.workspace = old_db
print('FEATURE CLASSES')
for fc in arcpy.ListFeatureClasses():
    print(fc)

    arcpy.Project_management(fc, join(new_db, fc), arcpy.SpatialReference(3857))
    relationship_class_names.update(arcpy.Describe(fc).relationshipClassNames)

print('TABLES')
for tbl in arcpy.ListTables():
    print(tbl)

    arcpy.CopyRows_management(tbl, join(new_db, tbl))
    relationship_class_names.update(arcpy.Describe(tbl).relationshipClassNames)

print('RELATIONSHIP CLASSES')
card_lu = {'OneToOne': 'ONE_TO_ONE',
           'OneToMany': 'ONE_TO_MANY',
           'ManyToMany': 'MANY_TO_MANY'}
arcpy.env.workspace = new_db
for rc in relationship_class_names:
    print(rc)

    rc_desc = arcpy.Describe(join(old_db, rc))

    keys = {}
    for k in rc_desc.originClassKeys:
        keys[k[1]] = k[0]
    if len(rc_desc.destinationClassKeys) > 0:
        print('DESTINATION KEYS!!!')
    arcpy.CreateRelationshipClass_management(join(new_db, rc_desc.originClassNames[0]),
                                             join(new_db, rc_desc.destinationClassNames[0]),
                                             rc,
                                             'SIMPLE',
                                             rc_desc.forwardPathLabel,
                                             rc_desc.backwardPathLabel,
                                             rc_desc.notification.upper(),
                                             card_lu[rc_desc.cardinality],
                                             'NONE',
                                             keys['OriginPrimary'],
                                             keys['OriginForeign'])

print('REFERENCE DATA')
arcpy.env.workspace = old_ref_db
for r in new_ref_db:
    print(r)
    arcpy.Project_management(r, join(new_ref_db, fc), arcpy.SpatialReference(3857))

print('done')
