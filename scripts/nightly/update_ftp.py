# updates related ftp packages
import arcpy
import os
import zipfile
import settings
from shutil import rmtree


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
                except Exception as e:
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

        categoryFolderPath = os.path.join(settings.FTP_root, packageCategory)

        if not os.path.isdir(categoryFolderPath):
            os.makedirs(categoryFolderPath)

        packageFolderPath = os.path.join(settings.FTP_root, packageCategory, 'PackagedData', '_Statewide', package["Name"])
        unpackagedFolderPath = os.path.join(settings.FTP_root, packageCategory, 'UnpackagedData')

        for clean_path in [packageFolderPath, unpackagedFolderPath]:
            if os.path.exists(clean_path):
                rmtree(clean_path)
            os.makedirs(clean_path)

        # make geodatabase
        arcpy.CreateFileGDB_management(packageFolderPath, package["Name"] + ".gdb")
        logger.info('geodatabase created')

        # populate local file geodatabase
        for fc in package["FeatureClasses"]:
            logger.info(fc)

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

                arcpy.CreateFileGDB_management(fcUnpackagedFolderPath, fc.split(".")[2] + ".gdb")

                arcpy.Copy_management(os.path.join(packageFolderPath, package["Name"] + ".gdb", fc.split(".")[2]),
                                      os.path.join(fcUnpackagedFolderPath, fc.split(".")[2] + ".gdb", fc.split(".")[2]))

                zfGDBUnpackaged = zipfile.ZipFile(os.path.join(fcUnpackagedFolderPath, fc.split(".")[2] + '_gdb.zip'), 'w', zipfile.ZIP_DEFLATED)
                zipws(os.path.join(fcUnpackagedFolderPath, fc.split(".")[2] + ".gdb"), zfGDBUnpackaged, True)
                zfGDBUnpackaged.close()

        arcpy.env.workspace = os.path.join(packageFolderPath, package["Name"] + ".gdb")

        # create zip file for shapefile package
        zfSHP = zipfile.ZipFile(os.path.join(packageFolderPath, package["Name"] + '_shp.zip'), 'w', zipfile.ZIP_DEFLATED)

        # output zipped shapefiles for each feature class
        for fc in arcpy.ListFeatureClasses():
            # create shapefile from the feature class
            arcpy.FeatureClassToShapefile_conversion(os.path.join(packageFolderPath, package["Name"]+".gdb", fc), packageFolderPath)

            # create unpackaged zip file and move data into that zip file
            zip_folder = os.path.join(unpackagedFolderPath, fc, '_Statewide')
            if not os.path.exists(zip_folder):
                os.makedirs(zip_folder)
            zfSHPUnpackaged = zipfile.ZipFile(os.path.join(zip_folder, fc + '_shp.zip'), 'w', zipfile.ZIP_DEFLATED)
            zipws(packageFolderPath, zfSHPUnpackaged, False)
            zfSHPUnpackaged.close()

        # add to package zipfile package
        zipws(packageFolderPath, zfSHP, False)
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


if __name__ == '__main__':
    import logging
    from forklift.__main__ import detailed_formatter
    import sys

    # copied from forklift
    log = logging.getLogger('deqhourly')

    log.logThreads = 0
    log.logProcesses = 0

    debug = 'DEBUG'

    try:
        os.path.makedirs(os.path.dirname(settings.FTP_root))
    except:
        pass

    file_handler = logging.handlers.RotatingFileHandler(os.path.join(settings.FTP_root, 'update_ftp.log'), backupCount=18)
    file_handler.doRollover()
    file_handler.setFormatter(detailed_formatter)
    file_handler.setLevel(debug)

    console_handler = logging.StreamHandler(stream=sys.stdout)
    console_handler.setFormatter(detailed_formatter)
    console_handler.setLevel(debug)

    log.addHandler(file_handler)
    log.addHandler(console_handler)
    log.setLevel(debug)

    run(log)

    log.info('complete!')
