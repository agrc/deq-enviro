[![Build Status](https://travis-ci.org/agrc/deq-enviro.png?branch=master)](https://travis-ci.org/agrc/deq-enviro)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/agrc-deq-enviro.svg)](https://saucelabs.com/u/agrc-deq-enviro)

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

[Stage](http://test.mapserv.utah.gov/deqenviro/)

[Production](http://enviro.deq.utah.gov)


## Nightly Script

Runs nightly on test and prod servers.

Builds `DEQEnviro.json` which the web app uses to configure itself. Part of building this json file is getting all of the map service layer indices so it needs to be rerun manually after adding, removing or reordering any of the map service layers. 

Make sure that you have a latest version of pip before `pip install -r requirements.txt`.

This script requires `settings/oauth2key.json`. Check out [the oauth2 gspread docs](http://gspread.readthedocs.org/en/latest/oauth2.html) to learn how to generate it. Make sure to grant read permission to the email address in `client_email` to the config spreadsheets.

Updates related data in SGID10. Reads sources from the config spreadsheet.
