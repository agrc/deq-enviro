FROM ghcr.io/osgeo/gdal:ubuntu-small-3.12.2 AS base

RUN apt update
RUN apt install -y python3-pip
RUN apt install -y libkrb5-dev
RUN apt install -y python3-venv

RUN python3 -m venv /opt/venv --system-site-packages
ENV PATH="/opt/venv/bin:$PATH"

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

CMD exec flask run -p 5010 -h 0.0.0.0

FROM base AS remote_dev

RUN apt install -y git

FROM base AS prod

COPY . .

RUN pip install .
RUN pip install arcgis==2.*
RUN pip install gunicorn

CMD exec gunicorn --bind :$PORT --timeout 0 download.main:app
