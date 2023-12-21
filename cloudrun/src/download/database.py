"""
A module for interacting with firestore
"""
from os import environ
from uuid import uuid4

from google.cloud import firestore

project = None
if environ.get("FLASK_DEBUG") == "1":
    #: setting the GOOGLE_CLOUD_PROJECT env var, causes gcloud to attempt to reauth
    project = "ut-dts-agrc-deq-enviro-dev"

client = firestore.Client(project)

"""
Job document structure:
{
  "id": "string",
  "created": "timestamp",
  "updated": "timestamp",
  "status": "processing|complete|failed",
  "format": "csv|excel|filegdb|geojson|shapefile",
  "layers": {
    "tableName": {
      "processed": "boolean",
      "error": "string"
    }
  },
  "error": "string",
}
"""


def create_job(layers, format):
    """
    Creates a job document in firestore.
    """
    id = uuid4().hex

    doc_ref = client.collection("jobs").document(id)
    doc_ref.set(
        {
            "id": id,
            "created": firestore.SERVER_TIMESTAMP,
            "updated": firestore.SERVER_TIMESTAMP,
            "status": "processing",
            "format": format,
            "layers": {layer: {"error": None, "processed": False} for layer in layers},
        }
    )

    return id


def update_job_status(id, status, error=None):
    """
    Updates a job document in firestore.
    """
    doc_ref = client.collection("jobs").document(id)
    doc_ref.update(
        {
            "updated": firestore.SERVER_TIMESTAMP,
            "status": status,
            "error": error,
        }
    )


def update_job_layer(id, layer, processed, error=None):
    """
    Updates a job document in firestore.
    """
    doc_ref = client.collection("jobs").document(id)
    doc_ref.update(
        {
            "updated": firestore.SERVER_TIMESTAMP,
            f"layers.{layer}.processed": processed,
            f"layers.{layer}.error": error,
        }
    )
