# note that the "3.12.3" version below is the GDAL version, not python
# 3.13.* updates to Ubuntu 26 which has python 3.14.
# We should wait to bump until arcpy supports python 3.14.
# also, we need to stay on numpy 1 until we bump this base image
# this is likely keeping arcgis pinned at 2.4.1 as well
FROM ghcr.io/osgeo/gdal:ubuntu-small-3.12.3 AS base

RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
	libkrb5-dev \
	python3-pip \
	python3-venv \
	&& rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv --system-site-packages
ENV PATH="/opt/venv/bin:$PATH"

FROM base AS dev

COPY . .

RUN pip install --no-cache-dir ".[dev]"
RUN pip install --no-cache-dir "arcgis==2.*" "numpy<2"

ENV FIRESTORE_EMULATOR_HOST="host.docker.internal:8080"
ENV FLASK_APP="download.main:app"
ENV FLASK_DEBUG="1"
ENV STORAGE_EMULATOR_HOST="http://host.docker.internal:9199"
ENV CLOUDSDK_CONFIG="/gcp/config/application_default_credentials.json"

CMD ["sh", "-c", "GOOGLE_APPLICATION_CREDENTIALS=${GOOGLE_APPLICATION_CREDENTIALS:-/gcp/config/application_default_credentials.json} exec flask run -p 5010 -h 0.0.0.0"]

FROM base AS remote_dev

RUN apt-get update \
	&& apt-get install -y --no-install-recommends git \
	&& rm -rf /var/lib/apt/lists/*

FROM base AS prod

COPY . .

RUN pip install --no-cache-dir .
RUN pip install --no-cache-dir "arcgis==2.*" "numpy<2"
RUN pip install --no-cache-dir gunicorn

CMD ["sh", "-c", "exec gunicorn --bind :${PORT} --timeout 0 download.main:app"]
