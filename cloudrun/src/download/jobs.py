"""Cloud Run Job execution helpers."""

from os import environ


def job_name():
    """Return the fully-qualified worker Job resource name."""
    try:
        project = environ["CLOUD_RUN_PROJECT"]
    except KeyError as error:
        raise RuntimeError(
            "CLOUD_RUN_PROJECT environment variable is not set"
        ) from error
    return f"projects/{project}/locations/us-central1/jobs/download-worker"


def start_job(job_id, client=None):
    """Start one worker execution with the Firestore job id as an override."""
    from google.cloud import run_v2

    client = client or run_v2.JobsClient()
    request = run_v2.RunJobRequest(
        name=job_name(),
        overrides=run_v2.RunJobRequest.Overrides(
            container_overrides=[
                run_v2.RunJobRequest.Overrides.ContainerOverride(
                    env=[run_v2.EnvVar(name="JOB_ID", value=job_id)]
                )
            ]
        ),
    )
    operation = client.run_job(request=request)
    return operation.operation.name
