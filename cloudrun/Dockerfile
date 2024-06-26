FROM ghcr.io/osgeo/gdal:ubuntu-small-latest as base

RUN apt update
RUN apt install -y python3-pip


FROM base as dev

COPY . .
RUN pip install .
RUN pip install arcgis==2.* --no-deps

ENV FIRESTORE_EMULATOR_HOST="host.docker.internal:8080"
ENV FLASK_APP="download.main:app"
ENV FLASK_DEBUG="1"
ENV STORAGE_EMULATOR_HOST="http://host.docker.internal:9199"
ENV GOOGLE_APPLICATION_CREDENTIALS="/gcp/config/application_default_credentials.json"
ENV CLOUDSDK_CONFIG="/gcp/config/application_default_credentials.json"

CMD exec flask run -p 5000 -h 0.0.0.0


FROM base as remote_dev

RUN apt install -y git


FROM base as prod

COPY . .

RUN pip install arcgis==2.* --no-deps
RUN pip install .
RUN pip install gunicorn

CMD exec gunicorn --bind :$PORT --timeout 0 download.main:app
