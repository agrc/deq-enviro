import build_json
import update_data
import agrc.logging

logger = agrc.logging.Logger()

# build json file
query_layers = build_json.run()

# get query layers from build_json and use to update data
update_data.run(query_layers, logger)

logger.writeLogToFile()

print('done')