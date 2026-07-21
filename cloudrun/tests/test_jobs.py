from download import jobs


def test_job_name(mocker):
    mocker.patch.dict(
        "download.jobs.environ",
        {
            "CLOUD_RUN_PROJECT": "example-project",
            "CLOUD_RUN_LOCATION": "us-central1",
            "CLOUD_RUN_JOB": "download-worker",
        },
        clear=True,
    )

    assert (
        jobs.job_name()
        == "projects/example-project/locations/us-central1/jobs/download-worker"
    )
