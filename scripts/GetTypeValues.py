import arcpy

gdb = r'C:\MapData\deqquerylayers.gdb'
fldTYPE = 'TYPE'


arcpy.env.workspace = gdb
for ds in arcpy.ListFeatureClasses():
    print('\n\n' + ds)

    if fldTYPE in [f.name for f in arcpy.ListFields(ds)]:
        with arcpy.da.SearchCursor(ds, [fldTYPE]) as cur:
            values = set([type for type, in cur])

            for v in values:
                print(v)
