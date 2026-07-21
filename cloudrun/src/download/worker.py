"""Cloud Run Job worker entry point."""

from os import environ

from . import database
from .main import dowork


def main():
    """Run the export identified by the JOB_ID environment variable."""
    job_id = environ.get("JOB_ID")
    if not job_id:
        raise RuntimeError("JOB_ID must be set")

    job = database.get_job(job_id)
    dowork(job_id, job["layers"], job["format"])


if __name__ == "__main__":
    main()
