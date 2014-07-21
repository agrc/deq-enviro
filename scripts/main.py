# main module that wires everything together

import agrc.logging
import build_json
import update_sgid
import update_fgdb
from agrc import messaging
import settings

emailer = None
logger = None
scriptName = 'DEQ Nightly'

def run():
    global emailer, logger
    errors = []

    emailer = messaging.Emailer(['stdavis@utah.gov', 'haroldsandbeck@utah.gov'], testing=settings.sendEmails)

    logger = agrc.logging.Logger()

    logger.logMsg('\n\n***** BUILDING JSON FILE')
    build_json.run()

    logger.logMsg('\n\n***** UPDATING SGID')
    errors = errors + update_sgid.run(logger)

    logger.logMsg('\n\n***** UPDATING FILE GEODATABASE')
    errors = errors + update_fgdb.run(logger)
    
    logger.logMsg('\n\n***** Script completed successfully.')

    logger.writeLogToFile()

    if len(errors) > 0:
        emailer.sendEmail('{} - Data Errors'.format(scriptName), 'There were errors in the nightly deq script: \n{}'.format('\n\n'.join(errors)))
    else:
        emailer.sendEmail('{} - Script Ran Successfully'.format(scriptName), 'Do you want the log here?')

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
#     run()