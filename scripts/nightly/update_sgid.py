'''
update_sgid.py

handles updating data in SGID from the app database
'''
import logging
from os import path

import arcpy
import settings


utm = arcpy.SpatialReference(26912)
period_replacement = '___'
logger = logging.getLogger('forklift')


def update_sgid_data(source, destination):
    logger.debug('updating: %s', destination)

    arcpy.DeleteRows_management(destination)
    arcpy.Append_management(source, destination, 'NO_TEST')


def update_sgid_for_crates(crates_from_slip):
    updated_crates = [crate for crate in crates_from_slip if crate['was_updated'] and not crate['name'].startswith('DirectFrom')]

    for crate_slip in updated_crates:
        sgid_name = path.basename(crate_slip['destination']).replace(period_replacement, '.')
        destination = path.join(settings.sgid[sgid_name.split('.')[1]], sgid_name)

        if sgid_name.startswith('SGID10'):
            update_sgid_data(crate_slip['destination'], destination)
