"""
Download server.
"""
from flask import Flask, request
from .download import download, cleanup
from .upload import upload
from dotenv import load_dotenv

from flask_cors import CORS
from flask_json import FlaskJSON

load_dotenv()

# pylint: disable=C0103
app = Flask(__name__)
FlaskJSON(app)
CORS(app)


@app.post("/")
def main():
    """
    Main entry point for the server.
    """
    layers = request.json["layers"]
    format = request.json["format"]

    try:
        output_path = download(layers, format)

        url = upload(output_path)
    finally:
        cleanup()

    return {"url": url, "success": True}
