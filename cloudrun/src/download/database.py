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
  "status": "processing|complete|failed",
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
            "status": "processing",
            "error": None,
            "layerResults": {
                layer["tableName"]: {"error": None, "processed": False}
                for layer in layers
            },
        }
    )

    return id


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
