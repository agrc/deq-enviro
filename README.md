[![Build Status](https://travis-ci.org/agrc/deq-enviro.png?branch=master)](https://travis-ci.org/agrc/deq-enviro)

deq-enviro
==========

DEQ Environmental Data Viewer

Generic application for searching, viewing and downloading DEQ GIS data and related tables.

[Requirements](https://docs.google.com/a/utah.gov/document/d/1DteUr8h8sS1OfC3gq2OFbdQfpIGmP28btCX1HUIaXek/edit)

[Scope of Work](https://docs.google.com/a/utah.gov/document/d/1YdutJqTW8biPDDsbnjl3S3Z8549c0dP2Pnguzpx4zTk/edit)

[Original Mockup](http://share.flairbuilder.com/?sid=78HL8R2y89#)

[Config Spreadsheet](https://docs.google.com/a/utah.gov/spreadsheet/ccc?key=0Aqee4VOgQcXcdG9DQzFEYld6UUtWRU1kNG5PMWVEY1E&usp=drive_web)

[Staging Config Spreadsheet](https://docs.google.com/a/utah.gov/spreadsheet/ccc?key=0Aqee4VOgQcXcdDBiTmo5X3pQdGdSYXYyNWZ1a2k0RVE#gid=0)

[Master Plan](https://github.com/agrc/deq-enviro/wiki/Master-Plan)

[Stage - test.mapserv.utah.gov/deqenviro/](http://test.mapserv.utah.gov/deqenviro/)

[Production - enviro.deq.utah.gov](http://enviro.deq.utah.gov)

## Testing
Unit tests are run via intern.

[Unit tests URL ](http://localhost:8000/node_modules/intern/client.html?config=tests/intern&suites=tests/unit/all) after running `grunt default`

## Nightly Script
Runs nightly on test and prod servers.

Builds `DEQEnviro.json` which the web app uses to configure itself. Part of building this json file is getting all of the map service layer indices so it needs to be rerun manually after adding, removing or reordering any of the map service layers.

Make sure that you have a latest version of pip before `pip install -r requirements.txt`.

This script requires `settings/oauth2key.json`. Check out [the oauth2 gspread docs](http://gspread.readthedocs.org/en/latest/oauth2.html) to learn how to generate it. Make sure to grant read permission to the email address in `client_email` to the config spreadsheets.

Updates related data in SGID10. Reads sources from the config spreadsheet.

## Data Schema Changes
Most updates are taken care of via the [config spreadsheet](https://docs.google.com/a/utah.gov/spreadsheet/ccc?key=0Aqee4VOgQcXcdG9DQzFEYld6UUtWRU1kNG5PMWVEY1E&usp=drive_web) and updating the schema of data.

#### Adding a new field
1. Add the field to the "Identify Attributes" column in the config spreadsheet. This will make it show up in the identify pane in the app.
1. Add the field to the data in SGID10 (prod & staging).
1. Add the field to the data in `staging/deqquerylayers.gdb`.
1. Delete the associated dataset in `staging/sgid_stage.gdb` if it's there.

## Deploy Steps
1. Set up and install [ArcGisServerPermissionsProxy](https://github.com/agrc/ArcGisServerPermissionsProxy).
    - Import RavenDB and web.config from previous server.
1. Set up users & roles in ArcGIS Server
    - Create new roles called `deq_water` & `deq_admin`.
    - Create users with the same names as the roles. Use the password from the Permission Proxy `web.config`.
1. Publish `maps/MapService.mxd` and `maps/Secure.mxd` to a `DEQEnviro` folder in ArcGIS Server.
    - `Secure` should be locked down to just the `deq_admin` and `deq_water` roles.
1. Publish ExportWebMap service to the `DEQEnviro` folder using `maps/PrintTemplates/Portrait.mxd` as the default template.
    - Make sure that the server can resolve the domain name that the app is hosted on (e.g. test.mapserv.utah.gov). If it can't you will need to edit the hosts file. This is required for the `ExportWebMap` service.
    - synchronous
1. Run and publish `scripts/download/DeqEnviro.pyt/download` as `Toolbox/download` in the same `DEQEnviro` folder.
    - `pip install xlsxwriter` on the hosting servier fom the python installation that ArcGIS Server uses (x64).
    - `pip install xlsxwriter` on the publishing server for the python installation that ArcGIS Desktop uses (x32).
    - You can use these inputs as a test:  
    ```
    {"BFNONTARGETED":["Pre5","Pre9","Pre8","Pre4","Pre7","Pre10","Pre12","Pre13","Pre14","Pre11","13","14"],"BFTARGETED":["2A","3","5","6","4","8","9","10","11","12","1","2","7"]}  
    shp  
    C:\MapData\deqquerylayers.gdb
    ```

1. Configure and schedule `scripts/nightly/main.py` to run nightly. Will likely need to copy `scripts/nightly/databases` and `scripts/nightly/settings/__init__.py` from the previous server.
1. Build and deploy the application by running `grunt build-prod && grunt deploy-prod`.
    - You will need to run `scripts/nightly/build_json.py` to generate `DEQEnviro.json` before you can load the application for the first time.
