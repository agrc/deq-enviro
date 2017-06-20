'''
hourly.py

A script to update DAQ data that needs to be updated hourly.
SGID10.ENVIRONMENT.DAQAirMonitorByStation
'''


from forklift import core
from forklift.messaging import send_email
from forklift.models import Crate
from os import path
from traceback import format_exc
from update_fgdb import validate_crate
from settings.dev import reportEmail
import logging.config
from logging import shutdown
import settings
from forklift.__main__ import log_location, detailed_formatter
from os import makedirs
import sys
import arcpy


def _setup_logging():
    # copied from forklift
    log = logging.getLogger('deqhourly')

    log.logThreads = 0
    log.logProcesses = 0

    debug = 'DEBUG'

    try:
        makedirs(path.dirname(log_location))
    except:
        pass

    file_handler = logging.handlers.RotatingFileHandler(log_location.replace('forklift.log', 'deqhourly.log'), backupCount=18)
    file_handler.doRollover()
    file_handler.setFormatter(detailed_formatter)
    file_handler.setLevel(debug)

    console_handler = logging.StreamHandler(stream=sys.stdout)
    console_handler.setFormatter(detailed_formatter)
    console_handler.setLevel(debug)

    log.addHandler(file_handler)
    log.addHandler(console_handler)
    log.setLevel(debug)

    return log


try:
    sgid_name = 'DAQAirMonitorData'
    sgid_stage = arcpy.env.scratchGDB
    sgid_db = settings.sgid['ENVIRONMENT']
    stage_db = r'C:\Scheduled\staging\deqquerylayers.gdb'
    source_db = path.join(settings.dbConnects, r'AVData.sde')
    source_name = 'AVData.dbo.interactive_map_monitoring_data'
    bad_results = [Crate.UNHANDLED_EXCEPTION, Crate.UNINITIALIZED]

    log = _setup_logging()

    log.info('creating crates')
    sde_update_crate = Crate(source_name, source_db, sgid_stage, sgid_name)
    stage_update_crate = Crate(sgid_name, sgid_db, stage_db, sgid_name)

    log.info('processing sde crate')
    core.init(log)
    sde_update_crate.set_result(core.update(sde_update_crate, validate_crate))
    if sde_update_crate.result[0] in [Crate.UPDATED, Crate.CREATED]:
        log.info('updating data in SDE')
        sgid_destination = path.join(sgid_db, 'SGID10.ENVIRONMENT.{}'.format(sgid_name))
        arcpy.management.TruncateTable(sgid_destination)
        arcpy.management.Append(sde_update_crate.destination, sgid_destination, 'NO_TEST')

        log.info('updating prod fgdbs')
        for dest_fgdb in [settings.mapData1, settings.mapData2]:
            dest = path.join(dest_fgdb, 'deqquerylayers.gdb', sgid_name)
            arcpy.management.TruncateTable(dest)
            arcpy.management.Append(sde_update_crate.destination, dest, 'NO_TEST')

    log.info('processing staging crate')
    stage_update_crate.set_result(core.update(stage_update_crate, validate_crate))

    if sde_update_crate.result[0] in bad_results:
        send_email(reportEmail,
                   'DEQ Hourly Crate Error',
                   'SDE Update Crate:\n{}\n\nFGDB Update Crates:\n{}\n{}'.format(sde_update_crate))
except Exception as e:
    log.error(format_exc())
    send_email(reportEmail, 'DEQ Hourly Script Error', format_exc())
finally:
    shutdown()
