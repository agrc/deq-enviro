#!/bin/bash
set -e

# this needs to be done after the docker image has been built because of the remote dev extension
pip install arcgis==2.*
pip install -e ".[dev]"
