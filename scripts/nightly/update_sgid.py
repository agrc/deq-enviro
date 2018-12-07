'''
update_sgid.py

handles updating data in SGID from the app database
'''
import logging
from os import path

import arcpy
import settings


period_replacement = '___'
logger = logging.getLogger('forklift')


def update_sgid_data(source, destination):
    logger.debug('updating: %s', destination)

    arcpy.DeleteRows_management(destination)
    arcpy.Append_management(source, destination, 'NO_TEST')


def update_sgid_for_crates(crates_from_slip):
    logger.info('getting SGID names lookup')
    sgid_lookup = {}
    arcpy.env.workspace = path.join(settings.dbConnects, 'SGID10.sde')
    for dataset in arcpy.ListTables() + arcpy.ListFeatureClasses():
        sgid_lookup[dataset.split('.')[-1]] = dataset
    arcpy.env.workspace = None

    updated_crates = [crate for crate in crates_from_slip if crate['was_updated'] and
                      not crate['source'].startswith('SGID10')]

    for crate_slip in updated_crates:
        sgid_name = sgid_lookup[crate_slip['name']]
        destination = path.join(settings.sgid[sgid_name.split('.')[1]], sgid_name)

        if sgid_name.startswith('SGID10'):
            update_sgid_data(crate_slip['destination'], destination)
