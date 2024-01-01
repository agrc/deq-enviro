"""
Download server.
"""
import threading
import traceback
from os import environ

from cloudevents.http import from_http
from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS
from flask_json import FlaskJSON

load_dotenv()  # this needs to be called before importing any other local modules

from . import bucket, database, log  # noqa: E402
from .agol import cleanup, download  # noqa: E402


formats = [
    "csv",
    "excel",
    "filegdb",
    "geojson",
    "shapefile",
]

# pylint: disable=C0103
app = Flask(__name__)
FlaskJSON(app)
CORS(app)


@app.post("/process_job")
def process_job():
    """
    Kicked off by eventarc event triggered when a new document is added to firestore
    """
    event = from_http(request.headers, request.get_data())
    log.logger.info(f"Received event: {event}")
    data = event["value"]["fields"]

    id = data["id"]
    layers = data["layers"]
    format = data["format"]

    return dowork(id, layers, format)


def dowork(id, layers, format):
    log.logger.info(f"Starting job {id}")
    try:
        output_path = download(id, layers, format)
        bucket.upload(id, output_path)

        database.update_job_status(id, "complete")
    except Exception as e:
        # Print stack trace to log
        log.logger.error(traceback.format_exc())
        database.update_job_status(id, "failed", str(e))
    finally:
        cleanup()

    log.logger.info(f"Job {id} complete")

    return {"success": True}


@app.post("/create_job")
def create_job():
    """
    Validates inputs and creates a new firestore document which, in turn, kicks off
    the process endpoint via EventArc.
    """
    layers = request.json["layers"]
    format = request.json["format"]

    if format not in formats:
        return {"success": False, "error": f"invalid format value: {format}"}, 400

    try:
        id = database.create_job(layers, format)

        if environ.get("FLASK_DEBUG") == "1":
            #: because we don't have an eventarc local emulator
            thread = threading.Thread(target=dowork, args=(id, layers, format))
            thread.start()

        return {"id": id, "success": True}
    except Exception as e:
        log.logger.error(traceback.format_exc())

        return {"success": False, "error": str(e)}, 500


@app.get("/download/<id>/data.zip")
def get_file(id):
    """
    Download a file.
    """
    stream = bucket.download(id)

    return stream, 200, {"Content-Type": "application/zip"}
