# updates related ftp packages
import arcpy
import os
import zipfile
import settings

packages = [
    {
        "Name": "DEQLandRelatedContaminantAndCleanupSites",
        "Category": "ENVIRONMENT",
        "ClipOptions": "",
        "FeatureClasses": [
            "SGID10.ENVIRONMENT.BFNONTARGETED",
            "SGID10.ENVIRONMENT.BFTARGETED",
            "SGID10.ENVIRONMENT.VCP",
            "SGID10.ENVIRONMENT.TRI",
            "SGID10.ENVIRONMENT.TIER2",
            "SGID10.ENVIRONMENT.SITEREM",
            "SGID10.ENVIRONMENT.NPL",
            "SGID10.ENVIRONMENT.MMRP",
            "SGID10.ENVIRONMENT.ICBUFFERZONES",
            "SGID10.ENVIRONMENT.FUD",
            "SGID10.ENVIRONMENT.FACILITYUST",
            "SGID10.ENVIRONMENT.EWA",
            "SGID10.ENVIRONMENT.DSHWSolidHazWasteUsedOilFacilities"
        ]
    }, {
        "Name": "DEQLandRelatedSites",
        "Category": "ENVIRONMENT",
        "ClipOptions": "",
        "FeatureClasses": [
            "SGID10.ENVIRONMENT.BFTARGETED",
            "SGID10.ENVIRONMENT.BFNONTARGETED",
            "SGID10.ENVIRONMENT.TRI",
            "SGID10.ENVIRONMENT.TIER2",
            "SGID10.ENVIRONMENT.ICBUFFERZONES",
            "SGID10.ENVIRONMENT.FACILITYUST",
            "SGID10.ENVIRONMENT.DSHWSolidHazWasteUsedOilFacilities"
        ]
    }, {
        "Name": "DEQLandRelatedSites",
        "Category": "ENVIRONMENT",
        "ClipOptions": "",
        "FeatureClasses": ["SGID10.ENVIRONMENT.DWQAssessmentUnits",
                           "SGID10.ENVIRONMENT.DWQGroundWaterPermits",
                           "SGID10.ENVIRONMENT.DWQMonitoredLakes132",
                           "SGID10.ENVIRONMENT.LakeMonitoring",
                           "SGID10.ENVIRONMENT.StreamMonitorSites"]
    }
]

logger = None
outPathRoot = r'\\grhnas01sp.state.ut.us\ftp\UtahSGID_Vector\UTM12_NAD83\\'
sdeConnectionStr = settings.sgid['ENVIRONMENT']


def zipws(path, zip, keep):
    global logger
    path = os.path.normpath(path)

    for (dirpath, dirnames, filenames) in os.walk(path):
        for file in filenames:
            if not file.endswith('.lock'):
                try:
                    if keep:
                        if os.path.join(dirpath, file).find('.zip') == -1:
                            zip.write(os.path.join(dirpath, file), os.path.join(os.path.basename(path), os.path.join(dirpath, file)[len(path)+len(os.sep):]))
                    else:
                        if os.path.join(dirpath, file).find('gdb') == -1 and os.path.join(dirpath, file).find('.zip') == -1:
                            zip.write(os.path.join(dirpath, file), file.split(".")[0] + '\\' + file)
                except Exception, e:
                    logger.error("Error adding %s: %s" % (file, e))
    return None


def run(logr):
    global logger
    logger = logr
    logger.info('updating ftp packages')

    for package in packages:
        logger.info(package['Name'])
        packageCategory = package["Category"]

        if packageCategory == '':
            # get from first featureclass in the package
            packageCategory = package["FeatureClassses"][0].split(".")[0]

        categoryFolderPath = os.path.join(outPathRoot, packageCategory)

        if not os.path.isdir(categoryFolderPath):
            os.makedirs(categoryFolderPath)

        packageFolderPath = os.path.join(outPathRoot, packageCategory, 'PackagedData', '_Statewide', package["Name"])
        unpackagedFolderPath = os.path.join(outPathRoot, packageCategory, 'UnpackagedData')

        if not os.path.isdir(packageFolderPath):
            os.makedirs(packageFolderPath)

        if not os.path.isdir(unpackagedFolderPath):
            os.makedirs(unpackagedFolderPath)

        # make geodatabase
        if arcpy.Exists(os.path.join(packageFolderPath, package["Name"] + ".gdb")):
            arcpy.Delete_management(os.path.join(packageFolderPath, package["Name"] + ".gdb"))
        arcpy.CreateFileGDB_management(packageFolderPath, package["Name"] + ".gdb", "9.3")
        logger.info('geodatabase created')

        # populate local file geodatabase
        for fc in package["FeatureClasses"]:
            logger.info(fc)
            arcpy.env.workspace = sdeConnectionStr  # ZZZ

            if arcpy.Exists(os.path.join(sdeConnectionStr, fc)):
                # add feature class to local file geodatabase to be packaged later
                try:
                    arcpy.Copy_management(os.path.join(sdeConnectionStr, fc), os.path.join(packageFolderPath, package["Name"] + ".gdb", fc))
                except:
                    pass  # assume that it's already been copied in a relationship

                # create another file gdb and copy to Unpackaged folder
                fcUnpackagedFolderPath = os.path.join(unpackagedFolderPath, fc.split(".")[2], '_Statewide')

                if not os.path.isdir(fcUnpackagedFolderPath):
                    os.makedirs(fcUnpackagedFolderPath)

                arcpy.CreateFileGDB_management(fcUnpackagedFolderPath, fc.split(".")[2] + ".gdb", "9.3")

                arcpy.Copy_management(os.path.join(packageFolderPath, package["Name"] + ".gdb", fc.split(".")[2]),
                                      os.path.join(fcUnpackagedFolderPath, fc.split(".")[2] + ".gdb", fc.split(".")[2]))

                zfGDBUnpackaged = zipfile.ZipFile(os.path.join(fcUnpackagedFolderPath, fc.split(".")[2] + '_gdb.zip'), 'w', zipfile.ZIP_DEFLATED)
                zipws(os.path.join(fcUnpackagedFolderPath, fc.split(".")[2] + ".gdb"), zfGDBUnpackaged, True)
                zfGDBUnpackaged.close()

                arcpy.Delete_management(os.path.join(fcUnpackagedFolderPath, fc.split(".")[2] + '.gdb'))

        arcpy.env.workspace = os.path.join(packageFolderPath, package["Name"] + ".gdb")

        # create zip file for shapefile package
        zfSHP = zipfile.ZipFile(os.path.join(packageFolderPath, package["Name"] + '_shp.zip'), 'w', zipfile.ZIP_DEFLATED)
        arcpy.env.overwriteOutput = True  # Overwrite pre-existing files

        # output zipped shapefiles for each feature class
        fileGDB_FCs = arcpy.ListFeatureClasses()

        for fc in fileGDB_FCs:
            # create shapefile for the feature class
            arcpy.FeatureClassToShapefile_conversion(os.path.join(packageFolderPath, package["Name"]+".gdb", fc), packageFolderPath)

            # add to package zipfile package
            zipws(packageFolderPath, zfSHP, False)

            # create unpackaged zip file and move data into that zip file
            zfSHPUnpackaged = zipfile.ZipFile(os.path.join(unpackagedFolderPath, fc, '_Statewide', fc + '_shp.zip'), 'w', zipfile.ZIP_DEFLATED)
            zipws(packageFolderPath, zfSHPUnpackaged, False)
            zfSHPUnpackaged.close()

            # delete temporary shapefiles
            arcpy.Delete_management(os.path.join(packageFolderPath, fc + ".shp"))
        zfSHP.close()

        # zip package geodatabase
        zfFGDB = zipfile.ZipFile(os.path.join(packageFolderPath, package["Name"] + '_gdb.zip'), 'w', zipfile.ZIP_DEFLATED)
        target_dir = os.path.join(packageFolderPath, package["Name"]+'.gdb')
        rootlen = len(target_dir) + 1
        for base, dirs, files in os.walk(target_dir):
            for file in files:
                fn = os.path.join(base, file)
                zfFGDB.write(fn, package["Name"]+".gdb/" + fn[rootlen:])
        zfFGDB.close()

        # delete temp geodatabase
        arcpy.Delete_management(os.path.join(packageFolderPath, package["Name"]+".gdb"))
