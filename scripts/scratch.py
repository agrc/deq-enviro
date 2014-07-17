# sets up and destroys scratch file geodatabase

import arcpy
from os import path

currentFolder = path.dirname(path.abspath(__file__))
name = 'scratch.gdb'
scratchGDB = path.join(currentFolder, name)

if arcpy.Exists(scratchGDB):
    arcpy.Delete_management(scratchGDB)

arcpy.CreateFileGDB_management(currentFolder, name)