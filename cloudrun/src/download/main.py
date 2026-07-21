"""
Download server.
"""

import traceback
from os import environ
from threading import Thread

from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS
from flask_json import FlaskJSON

load_dotenv()  # this needs to be called before importing any other local modules

from . import bucket, database, jobs, log  # noqa: E402
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


def start_local_worker(id, launch_token):
    """Mark a local job as processing and run it outside the request thread."""
    job = database.get_job(id)
    if not database.mark_job_processing(id, launch_token, "local"):
        raise RuntimeError(f"Job {id} launch claim was lost")

    Thread(
        target=dowork,
        args=(id, job["layers"], job["format"]),
        daemon=True,
    ).start()


@app.post("/create_job")
def create_job():
    """
    Validates inputs, creates a Firestore job, and starts its Cloud Run Job worker.
    """
    layers = request.json["layers"]
    format = request.json["format"]

    if format not in formats:
        return {"success": False, "error": f"invalid format value: {format}"}, 400

    try:
        id = database.create_job(layers, format)
        launch_token = database.claim_job_launch(id)
        if environ.get("RUN_WORKER_LOCALLY") == "1":
            start_local_worker(id, launch_token)
        else:
            operation_name = jobs.start_job(id)
            if not database.mark_job_processing(id, launch_token, operation_name):
                raise RuntimeError(f"Job {id} launch claim was lost")

        return {"id": id, "success": True}
    except Exception as e:
        log.logger.error(traceback.format_exc())
        if "id" in locals():
            database.mark_job_failed(id, str(e))

        return {"success": False, "error": str(e)}, 500


@app.get("/download/<id>/data.zip")
def get_file(id):
    """
    Download a file.
    """
    stream = bucket.download(id)

    return stream, 200, {"Content-Type": "application/zip"}
