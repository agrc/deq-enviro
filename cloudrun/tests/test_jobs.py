from download import jobs


def test_job_name(mocker):
    mocker.patch.dict(
        "download.jobs.environ",
        {"CLOUD_RUN_PROJECT": "example-project"},
        clear=True,
    )

    assert (
        jobs.job_name()
        == "projects/example-project/locations/us-central1/jobs/download-worker"
    )
