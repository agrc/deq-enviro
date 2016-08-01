#!/usr/bin/env python
# * coding: utf8 *
'''
hourly.py

A script to update DAQ data that needs to be updated hourly.
SGID10.ENVIRONMENT.DAQAirMonitorByStation
'''


from forklift.__main__ import _setup_logging
from forklift.core import update
from forklift.messaging import send_email
from forklift.models import Crate
from os import path
from traceback import format_exc
from update_fgdb import validate_crate
from settings.dev import reportEmail
import logging
import settings


try:
    sgid_name = 'DAQAirMonitorData'
    sgid_db = settings.sgid['ENVIRONMENT']
    stage_db = r'C:\Scheduled\staging\deqquerylayers.gdb'
    source_db = path.join(settings.dbConnects, r'eqmairvisionp.sde')
    source_name = 'AVData.dbo.interactive_map_monitoring_data'
    bad_results = [Crate.UNHANDLED_EXCEPTION, Crate.UNINITIALIZED]

    _setup_logging(False)

    log = logging.getLogger('forklift')

    log.info('creating crates')
    sde_update_crate = Crate(source_name, source_db, sgid_db, sgid_name)
    fgdb_update_crate1 = Crate(sgid_name, sgid_db, path.join(settings.mapData1, 'deqquerylayers.gdb'), sgid_name)
    fgdb_update_crate2 = Crate(sgid_name, sgid_db, path.join(settings.mapData2, 'deqquerylayers.gdb'), sgid_name)
    stage_update_crate = Crate(sgid_name, sgid_db, stage_db, sgid_name)

    log.info('processing sde crate')
    sde_update_crate.set_result(update(sde_update_crate, validate_crate))
    log.info('processing fgdb crate')
    fgdb_update_crate1.set_result(update(fgdb_update_crate1, validate_crate))
    fgdb_update_crate2.set_result(update(fgdb_update_crate2, validate_crate))
    log.info('processing staging crate')
    stage_update_crate.set_result(update(stage_update_crate, validate_crate))

    if sde_update_crate.result[0] in bad_results or fgdb_update_crate1.result in bad_results or fgdb_update_crate2.result in bad_results:
        send_email(reportEmail,
                   'DEQ Hourly Crate Error',
                   'SDE Update Crate:\n{}\n\nFGDB Update Crates:\n{}\n{}'.format(sde_update_crate, fgdb_update_crate1, fgdb_update_crate2))
except Exception as e:
    send_email(reportEmail, 'DEQ Hourly Script Error', format_exc())
