FROM ghcr.io/osgeo/gdal:ubuntu-small-latest as base

RUN apt update
RUN apt install -y python3-pip


FROM base as dev

RUN apt install -y git


FROM base as prod

COPY . .

RUN pip install arcgis==2.* --no-deps
RUN pip install .
RUN pip install gunicorn

CMD exec gunicorn --bind :$PORT download.main:app
