"""
A module for interacting with firestore
"""

from os import environ
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from google.cloud import firestore

project = None
if environ.get("FLASK_DEBUG") == "1":
    #: setting the GOOGLE_CLOUD_PROJECT env var, causes gcloud to attempt to reauth
    project = "ut-dts-agrc-deq-enviro-dev"

client = firestore.Client(project)

"""
Job input document structure:
{
  "id": "string",
  "created": "timestamp",
    "format": "csv|excel|filegdb|geojson|shapefile",
  "layers": [LayerConfig],
}

Job results document structure:
{
  "id": "string",
  "updated": "timestamp",
    "status": "queued|launching|processing|complete|failed",
  "layerResults": {
    "tableName": {
      "processed": "boolean",
      "error": "string"
    }
  },
  "error": "string",
}
"""
results_doc = "{}-results"
input_doc = "{}-input"


def get_job(id):
    """
    Gets a input document from firestore.
    """
    doc_ref = client.collection("jobs").document(input_doc.format(id))
    snapshot = doc_ref.get()

    if not snapshot.exists:
        raise Exception(f"Job {id} not found")

    return snapshot.to_dict()


def create_job(layers, format):
    """
    Creates a job document in firestore.
    """
    id = uuid4().hex

    input_ref = client.collection("jobs").document(input_doc.format(id))
    input_ref.set(
        {
            "id": id,
            "created": firestore.SERVER_TIMESTAMP,
            "format": format,
            "layers": layers,
        }
    )

    results_ref = client.collection("jobs").document(results_doc.format(id))
    results_ref.set(
        {
            "id": id,
            "updated": firestore.SERVER_TIMESTAMP,
            "status": "queued",
            "error": None,
            "layerResults": {
                layer["tableName"]: {"error": None, "processed": False}
                for layer in layers
            },
        }
    )

    return id


def claim_job_launch(id, lease_seconds=120):
    """Claim a queued job for launch and return its stable launch token."""
    transaction = client.transaction()
    doc_ref = client.collection("jobs").document(results_doc.format(id))

    @firestore.transactional
    def claim(transaction):
        snapshot = doc_ref.get(transaction=transaction)
        if not snapshot.exists:
            raise Exception(f"Job {id} not found")

        data = snapshot.to_dict()
        if data.get("status") != "queued":
            return None

        launch_token = uuid4().hex
        transaction.update(
            doc_ref,
            {
                "status": "launching",
                "launchToken": launch_token,
                "launchLeaseUntil": datetime.now(timezone.utc)
                + timedelta(seconds=lease_seconds),
                "updated": firestore.SERVER_TIMESTAMP,
            },
        )
        return launch_token

    return claim(transaction)


def mark_job_processing(id, launch_token, operation_name):
    """Persist the launch operation and expose the job as processing."""
    doc_ref = client.collection("jobs").document(results_doc.format(id))
    transaction = client.transaction()

    @firestore.transactional
    def update(transaction):
        if not launch_token:
            return False

        snapshot = doc_ref.get(transaction=transaction)
        if not snapshot.exists:
            return False

        data = snapshot.to_dict()
        if data.get("status") != "launching" or data.get("launchToken") != launch_token:
            return False

        transaction.update(
            doc_ref,
            {
                "status": "processing",
                "operation": operation_name,
                "launchLeaseUntil": None,
                "updated": firestore.SERVER_TIMESTAMP,
            },
        )
        return True

    return update(transaction)


def mark_job_failed(id, error):
    """Record a failure while creating the worker execution."""
    update_job_status(id, "failed", error)


def update_job_status(id, status, error=None):
    """
    Updates a job document in firestore.
    """
    doc_ref = client.collection("jobs").document(results_doc.format(id))
    doc_ref.update(
        {
            "updated": firestore.SERVER_TIMESTAMP,
            "status": status,
            "error": error,
        },
    )


def update_job_layer(id, layer, processed, error=None):
    """
    Updates a job document in firestore.
    """
    doc_ref = client.collection("jobs").document(results_doc.format(id))
    doc_ref.update(
        {
            "updated": firestore.SERVER_TIMESTAMP,
            f"layerResults.{layer}.processed": processed,
            f"layerResults.{layer}.error": error,
        },
    )
