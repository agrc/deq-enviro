# script intended to be scheduled to run hourly to update DAQ data

import update_sgid
import update_fgdb
from agrc import messaging
from agrc import logging
import settings

emailer = None
logger = None
scriptName = 'DEQ Hourly'
sgidName = 'SGID10.ENVIRONMENT.DAQAirMonitorByStation'

def run():
    global emailer, logger
    emailer = messaging.Emailer(['stdavis@utah.gov', 'haroldsandbeck@utah.gov', 'woswald@utah.gov'], testing=not settings.sendEmails)
    logger = logging.Logger()

    if check_errors(update_sgid.run(logger, sgidName)):
        return

    if check_errors(update_fgdb.run(logger, sgidName)):
        return

def check_errors(errors):
    if len(errors) > 0:
        emailer.sendEmail('{} - Errors'.format(scriptName),
                          'There was an error with the hourly script: \n{}'.format('\n\n'.join(errors)))
        return True
    else:
        return False

def run_with_try_catch():
    try:
        run()
    except Exception:
        logger.logError()
        emailer.sendEmail('{} - Script Error'.format(scriptName), logger.log)
    finally:
        logger.writeLogToFile()

if __name__ == "__main__":
    run_with_try_catch()