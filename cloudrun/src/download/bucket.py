"""
A module for uploading the downloaded data to a cloud storage bucket.
"""
from google.cloud import storage
import shutil
from uuid import uuid4
from .log import logger

storage_client = storage.Client()
bucket = storage_client.bucket("ut-dts-agrc-deq-enviro-dev.appspot.com")


def upload(path):
    """
    Uploads the data to a cloud storage bucket.
    """
    logger.info("uploading to bucket")

    # zip contents of path
    zip_file = shutil.make_archive(path, "zip", path)

    id = uuid4().hex
    blob = bucket.blob(f"{id}.zip")
    blob.upload_from_filename(zip_file)

    return id


def download(id):
    """
    Gets a download stream from the bucket for the given id
    """

    blob = bucket.blob(f"{id}.zip")

    return blob.download_as_bytes()
