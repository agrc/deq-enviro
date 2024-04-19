import logging
from google.cloud.logging import Client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("download")

try:
    client = Client()
    client.setup_logging()
except OSError:
    # swallow errors when running locally
    pass
