'''
update_sgid.py

handles updating data in SGID from the app database
'''
import logging
from os import path

import arcpy
import settings

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

    for crate_slip in updated_crates:
        sgid_name = sgid_lookup[crate_slip['name']]
        owner_connection = settings.sgid[sgid_name.split('.')[1]]
        destination = path.join(owner_connection, sgid_name)

        if sgid_name.startswith('SGID'):
            update_sgid_data(crate_slip['destination'], destination)
            swapper.copy_and_replace(crate_slip['destination'], destination, owner_connection, ['internal'])
