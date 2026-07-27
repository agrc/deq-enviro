import logging

from google.auth.exceptions import GoogleAuthError
from google.cloud.logging import Client

try:
    Client().setup_logging()
except (GoogleAuthError, OSError):
    logging.basicConfig(level=logging.INFO)

logger = logging.getLogger("download")
