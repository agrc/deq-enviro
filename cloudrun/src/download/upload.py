"""
A module for uploading the downloaded data to a cloud storage bucket.
"""
from google.cloud import storage
import shutil

storage_client = storage.Client()
bucket = storage_client.bucket("ut-dts-agrc-deq-enviro-dev.appspot.com")


def upload(path):
    """
    Uploads the data to a cloud storage bucket.
    """
    print("uploading to bucket")

    # zip contents of path
    zip_file = shutil.make_archive(path, "zip", path)

    blob = bucket.blob("test.zip")
    blob.upload_from_filename(zip_file)

    return blob.public_url
