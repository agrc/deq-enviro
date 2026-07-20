import logging
from google.cloud.logging import Client
from google.auth.exceptions import GoogleAuthError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("download")

try:
    client = Client()
    client.setup_logging()
except (GoogleAuthError, OSError):
    # swallow errors when running locally
    pass
