"""
Download server.
"""
import threading
import traceback

from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS
from flask_json import FlaskJSON

from . import bucket, database, log
from .agol import cleanup, download

load_dotenv()

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


@app.post("/generate")
def generate():
    """
    Main entry point for the server.
    """
    layers = request.json["layers"]
    format = request.json["format"]

    if format not in formats:
        return {"success": False, "error": f"invalid format value: {format}"}, 400

    try:
        id = database.create_job([layer["tableName"] for layer in layers], format)

        # do the work in a separate thread so we can return the id right away
        thread = threading.Thread(target=dowork, args=(id, layers, format))
        thread.start()

        return {"id": id, "success": True}
    except Exception as e:
        log.logger.error(e)
        return {"success": False, "error": str(e)}, 500


@app.get("/download/<id>/data.zip")
def get_file(id):
    """
    Download a file.
    """
    stream = bucket.download(id)

    return stream, 200, {"Content-Type": "application/zip"}
