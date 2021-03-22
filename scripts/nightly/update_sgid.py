'''
update_sgid.py

handles updating data in SGID from the app database
'''
import logging
from os import path
from pathlib import Path

import arcpy
import settings
import update_fgdb

from swapper import swapper


period_replacement = '___'
logger = logging.getLogger('forklift')


def update_sgid_for_crates(crates_from_slip):
    logger.info('getting SGID names lookup')
    sgid_lookup = {}
    arcpy.env.workspace = path.join(settings.dbConnects, 'SGID.sde')
    for dataset in arcpy.ListTables() + arcpy.ListFeatureClasses():
        sgid_lookup[dataset.split('.')[-1]] = dataset
    arcpy.env.workspace = None

    updated_crates = [crate for crate in crates_from_slip if crate['was_updated'] and
                      'sgid.' not in crate['source'].lower()]

    utm = arcpy.SpatialReference(26912)

    for crate_slip in updated_crates:
        sgid_name = sgid_lookup[crate_slip['name']]
        owner_connection = settings.sgid[sgid_name.split('.')[1]]
        destination = path.join(owner_connection, sgid_name)

        if sgid_name.casefold().startswith('sgid'):
            logger.info(f'updating {sgid_name}')
            scratch = Path(arcpy.env.scratchFolder) / 'deq_data_for_sgid.gdb'
            source = crate_slip['destination']
            temp_table = str(Path(scratch / Path(source).name))

            if not arcpy.Exists(str(scratch)):
                arcpy.CreateFileGDB_management(str(scratch.parent), scratch.name)

            if arcpy.Exists(temp_table):
                logger.debug(f'deleting {temp_table}')
                arcpy.Delete_management(temp_table)

            if arcpy.da.Describe(source)['datasetType'] == 'Table':
                logger.debug('copying rows')
                arcpy.CopyRows_management(source, temp_table)
            else:
                logger.debug('projecting')
                arcpy.Project_management(source, temp_table, utm, 'NAD_1983_To_WGS_1984_5')

            arcpy.DeleteField_management(temp_table, ['FORKLIFT_HASH'] + update_fgdb.commonFields)
            swapper.copy_and_replace(Path(temp_table), Path(destination), Path(owner_connection), ['internal'])
