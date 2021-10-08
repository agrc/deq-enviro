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

            #: only remove app fields if they didn't already exist in source data
            config = update_fgdb.get_spreadsheet_config_from_dataset(source)
            delete_fields = []
            for field in update_fgdb.commonFields + ['FORKLIFT_HASH']:
                try:
                    if config[field].upper() != field:
                        delete_fields.append(field)
                except KeyError:
                    #: skip if this is a related table config
                    continue

            if len(delete_fields) > 0:
                logger.debug(f'deleting fields: {delete_fields}')
                arcpy.DeleteField_management(temp_table, delete_fields)

            current_metadata = arcpy.metadata.Metadata(destination)
            swapper.copy_and_replace(Path(temp_table), Path(destination), Path(owner_connection), ['internal'])
            new_metadata = arcpy.metadata.Metadata(destination)
            new_metadata.copy(current_metadata)
            new_metadata.save()
