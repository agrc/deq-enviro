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

These are managed via the "Data" tab of the AGOL item. Any changes should immediately be reflected in the application. The config spreadsheet also supports defining aliases for fields with the following syntax: `FieldName (Field Alias)`. If an alias is defined in the config spreadsheet, it will take precedence over the AGOL alias.

### Results Grid Fields

The fields that show up in the results grid after searching are configurable via the "Result Grid Fields" column in the config spreadsheet. This can contain anywhere from 1 to 5 fields. Aliases can be defined in the source AGOL service or via the following syntax FieldName `(Field Alias), AnotherField (Another Field Alias)`.

### Symbology

This is managed via the "Visualization" tab of the AGOL item. Any changes should immediately be reflected in the application. If there is no specific symbology defined, the app has some reasonable defaults that look better than the AGOL defaults.

### Map Labels

These are also managed via the "Visualization" tab of the AGOL item. Any changes should immediately be reflected in the application. The config spreadsheet also supports defining a map label field via the "Map Label Field" column. If a map label field is defined in the config spreadsheet, it will take precedence over the AGOL label field.

### Links (Identify Panel)

The links in the "Links" tab in the identify panel are controlled via the corresponding columns in the config spreadsheet. If you want to append the feature's attributes to the URL, use the following syntax: `https://example.com?param1={field1}&param2={field2}`.

### Data Schema Changes

Most updates are taken care of via the config spreadsheet.

### Adding a New Query Layer

1. Add the new row in the config spreadsheet
1. Deploy changes

## Local Development

### updateRemoteConfigFromSheets Function

You will need to copy the `functions-key-dev.json` key file from the terraform project to the `functions` directory in order to have permissions to hit the staging config spreadsheet.

### Cloud Run

The download service is hosted in Cloud Run since it requires a custom Docker container. The are npm scripts for building and running the container for local development. If you are working on the download service itself, you can run the "Dev Containers: Reopen in Container" command in VSCode. This will give you the ability to use the python environment defined in the Dockerfile with VSCode extensions. It also has a launch config allowing you to debug the service. Don't forget to run `npm run dev:firebase` to start the emulator since the download service depends on it.

## Config Spreadsheet Deploy Addon

This is accomplished via Google Apps Scripts. An example script and json config can be found in the `src/apps-script` directory.

Note that the Apps Scripts GCP project needs to be pointed at the same GCP project as the hosting project.

This [blog post](https://medium.com/geekculture/how-to-call-google-cloud-run-or-cloud-functions-from-apps-scripts-c0086289c965) was a good reference for setting it up.
