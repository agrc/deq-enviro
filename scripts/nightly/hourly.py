'''
hourly.py

A script to update DAQ data that needs to be updated hourly.
SGID.ENVIRONMENT.DAQAirMonitorByStation
'''


import logging.config
import sys
from logging import shutdown
from os import makedirs, path
from traceback import format_exc

import arcpy
import settings
from forklift import core
from forklift.__main__ import detailed_formatter, log_location
from forklift.messaging import send_email
from forklift.models import Crate
from settings.dev import reportEmail
from update_fgdb import validate_crate


def _setup_logging():
    # copied from forklift
    log = logging.getLogger('deqhourly')

    log.logThreads = 0
    log.logProcesses = 0

    debug = 'DEBUG'

    try:
        makedirs(path.dirname(log_location))
    except Exception:
        pass

    file_handler = logging.handlers.RotatingFileHandler(log_location.replace('forklift.log', 'deqhourly.log'),
                                                        backupCount=18)
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
    sgid_db = settings.sgid['ENVIRONMENT']
    stage_db = r'C:\forklift\data\hashed\deqquerylayers.gdb'
    source_db = path.join(settings.dbConnects, r'AVData.sde')
    source_name = 'AVData.dbo.interactive_map_monitoring_data'
    bad_results = [Crate.INVALID_DATA, Crate.UNHANDLED_EXCEPTION, Crate.UNINITIALIZED, Crate.ERROR]

    log = _setup_logging()

    log.info('creating crate')
    crate = Crate(sgid_name, sgid_db, stage_db, sgid_name)

    log.info('processing crate')
    core.init(log)
    crate.set_result(core.update(crate, validate_crate))
    if crate.was_updated():
        log.info('updating data in SDE')
        sgid_destination = path.join(sgid_db, 'SGID.ENVIRONMENT.{}'.format(sgid_name))
        arcpy.management.TruncateTable(sgid_destination)
        arcpy.management.Append(crate.destination, sgid_destination, 'NO_TEST')

        log.info('updating prod fgdbs')
        for dest_fgdb in [settings.mapData1, settings.mapData2]:
            dest = path.join(dest_fgdb, 'deqquerylayers.gdb', sgid_name)
            arcpy.management.TruncateTable(dest)
            arcpy.management.Append(crate.destination, dest, 'NO_TEST')

    if crate.result[0] in bad_results:
        send_email(reportEmail,
                   'DEQ Hourly Crate Error',
                   'Crate Result: \n{}'.format(crate.result))

    log.info('Process completed successfully. Have a nice day.')
except Exception as e:
    log.error(format_exc())
    send_email(reportEmail, 'DEQ Hourly Script Error', format_exc())
finally:
    shutdown()
