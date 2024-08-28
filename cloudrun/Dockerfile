# this is pinned so that we stay at python 3.10 until
# arcgis is updated to support python 3.12
FROM ghcr.io/osgeo/gdal:ubuntu-small-3.8.5 AS base

RUN apt update
RUN apt install -y python3-pip
RUN apt install -y libkrb5-dev

FROM base AS dev

COPY . .

RUN pip install .
RUN pip install arcgis==2.*

ENV FIRESTORE_EMULATOR_HOST="host.docker.internal:8080"
ENV FLASK_APP="download.main:app"
ENV FLASK_DEBUG="1"
ENV STORAGE_EMULATOR_HOST="http://host.docker.internal:9199"
ENV GOOGLE_APPLICATION_CREDENTIALS="/gcp/config/application_default_credentials.json"
ENV CLOUDSDK_CONFIG="/gcp/config/application_default_credentials.json"

CMD exec flask run -p 5000 -h 0.0.0.0

FROM base AS remote_dev

RUN apt install -y git

FROM base AS prod

COPY . .

RUN pip install .
RUN pip install arcgis==2.*
RUN pip install gunicorn

CMD ["gunicorn", "--bind", ":$PORT", "--timeout", "0", "download.main:app"]
