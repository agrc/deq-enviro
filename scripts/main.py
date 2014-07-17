# main module that wires everything together

import agrc.logging
import build_json
import update_sgid
import update_fgdb

logger = agrc.logging.Logger()

logger.logMsg('building json')
build_json.run()

logger.logMsg('updating SGID')
update_sgid.run()

logger.logMsg('updating FGDB')
update_fgdb.run()

logger.writeLogToFile()
print('done')