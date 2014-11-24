# main module that wires everything together

import agrc.logging
import build_json
import update_sgid
import update_fgdb
from agrc import messaging
import settings
import sys

emailer = None
logger = None
scriptName = 'DEQ Nightly'

def run():
    global emailer, logger
    emailer = messaging.Emailer(['stdavis@utah.gov', 'haroldsandbeck@utah.gov'], testing=not settings.sendEmails)

    logger = agrc.logging.Logger()

    logger.logMsg('\n\n***** BUILDING JSON FILE')
    build_json.run()

    logger.logMsg('\n\n***** UPDATING SGID')
    if len(sys.argv) == 2:
        sdeErrors = update_sgid.run(logger, sys.argv[1])
    else:
        sdeErrors = update_sgid.run(logger)

    logger.logMsg('\n\n***** UPDATING FILE GEODATABASE')
    if len(sys.argv) == 2:
        fgdbErrors = update_fgdb.run(logger, sys.argv[1])
    else:
        fgdbErrors = update_fgdb.run(logger)
    
    logger.logMsg('\n\n***** Script completed successfully.')

    logger.writeLogToFile()

    if len(sdeErrors) + len(fgdbErrors) > 0:
        errors = 'SDE UPDATE ERRORS:\n\n{}\n\n\n\nFGDB UPDATE ERRORS:\n\n{}'.format('\n\n'.join(sdeErrors), '\n\n'.join(fgdbErrors))
        emailer.sendEmail('{} - Data Errors'.format(scriptName), 
                          'There were {} errors in the nightly deq script: \n{}'.format(len(sdeErrors + fgdbErrors), errors))
    else:
        emailer.sendEmail('{} - Script Ran Successfully'.format(scriptName), 'Updated datasets:\n{}'.format('\n'.join(update_fgdb.successes)))

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