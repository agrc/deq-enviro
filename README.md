# deq-enviro [![Build Status](https://travis-ci.org/agrc/deq-enviro.png?branch=master)](https://travis-ci.org/agrc/deq-enviro)

DEQ Environmental Data Viewer

Generic application for searching, viewing and downloading DEQ GIS data and related tables.

[Production Config Spreadsheet](https://docs.google.com/a/utah.gov/spreadsheet/ccc?key=0Aqee4VOgQcXcdG9DQzFEYld6UUtWRU1kNG5PMWVEY1E&usp=drive_web)

[Staging Config Spreadsheet](https://docs.google.com/a/utah.gov/spreadsheet/ccc?key=0Aqee4VOgQcXcdDBiTmo5X3pQdGdSYXYyNWZ1a2k0RVE#gid=0)

[Stage - enviro.dev.utah.gov](https://enviro.dev.utah.gov)

[Production - enviro.deq.utah.gov](https://enviro.deq.utah.gov)

[Analytics Dashboard](https://lookerstudio.google.com/reporting/87fdea59-ccfa-4ff7-b9d1-9bceabc3db1f/page/ZaM7C)

## Query Layers

### Requirements

In order for a dataset to be used as a query layer within the application, it must satisfy all of the following requirements:

- Hosted in ArcGIS Online or ArcGIS Portal
- "Export Data" enabled

### Field Aliases

These are managed via the "Data" tab of the AGOL item. Any changes should immediately be reflected in the application.

### Symbology

This is managed via the "Visualization" tab of the AGOL item. Any changes should immediately be reflected in the application. If there is no specific symbology defined, the app has some reasonable defaults that look better than the AGOL defaults.

### Links (Identify Panel)

The links in the "Links" tab in the identify panel are controlled via the corresponding columns in the config spreadsheet. If you want to append the feature's attributes to the URL, use the following syntax: `https://example.com?param1={field1}&param2={field2}`.

### Data Schema Changes

Most updates are taken care of via the config spreadsheet.

### Adding a New Query Layer

1. Add the new row in the config spreadsheet
1. Deploy changes

## Deploy Steps

1. Publish ExportWebMap service to the `DEQEnviro` folder using `maps/PrintTemplates/Portrait.mxd` as the default template.
   - Make sure that the server can resolve the domain name that the app is hosted on (e.g. test.mapserv.utah.gov). If it can't you will need to edit the hosts file. This is required for the `ExportWebMap` service.
   - synchronous
1. Add repo to forklift.
   1. Copy `scripts/nightly/databases` & `scripts/nightly/settings/__init__.py` from old server.
   1. Download and install the latest [oracle instant client](https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html).
   1. From within the forklift environment: `pip install -r .\scripts\nightly\requirements.txt`

## Local Development

### updateRemoteConfigFromSheets Function

You will need to copy the `functions-key-dev.json` key file from the terraform project to the `functions` directory in order to have permissions to hit the staging config spreadsheet.

## Config Spreadsheet Deploy Addon

This is accomplished via Google Apps Scripts. An example script and json config can be found in the `src/apps-script` directory.

Note that the Apps Scripts GCP project needs to be pointed at the same GCP project as the hosting project.
