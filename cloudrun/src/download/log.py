import logging
from google.cloud.logging import Client
from google.auth.exceptions import GoogleAuthError


try:
    Client().setup_logging()
except (GoogleAuthError, OSError):
    logging.basicConfig(level=logging.INFO)
    # swallow errors when running locally
    pass

logger = logging.getLogger("download")
