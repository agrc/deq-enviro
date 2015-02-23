[![Build Status](https://travis-ci.org/agrc/deq-enviro.png?branch=master)](https://travis-ci.org/agrc/deq-enviro)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/agrc-deq-enviro.svg)](https://saucelabs.com/u/agrc-deq-enviro)

deq-enviro
==========

DEQ Environmental Data Viewer

Generic application for searching, viewing and downloading DEQ GIS data and related tables.

[Requirements](https://docs.google.com/a/utah.gov/document/d/1DteUr8h8sS1OfC3gq2OFbdQfpIGmP28btCX1HUIaXek/edit)

[Scope of Work](https://docs.google.com/a/utah.gov/document/d/1YdutJqTW8biPDDsbnjl3S3Z8549c0dP2Pnguzpx4zTk/edit)

[Original Mockup](http://share.flairbuilder.com/?sid=78HL8R2y89#)

[Query Layers](https://docs.google.com/a/utah.gov/spreadsheet/ccc?key=0Aqee4VOgQcXcdG9DQzFEYld6UUtWRU1kNG5PMWVEY1E&usp=drive_web)

[Master Plan](https://github.com/agrc/deq-enviro/wiki/Master-Plan)

[Staging](http://test.mapserv.utah.gov/deqenviro/)


### Deploy Notes

To publish the `ExportWebMap` service follow [these steps](http://resources.arcgis.com/en/help/main/10.2/index.html#//00570000009s000000).
- Templates folder is `maps\PrintTemplates` (not a registered folder with the server).
- Default template is `Portrait.mxd`