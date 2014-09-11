Requirements for running the nightly script:

- a 'databases' folder (placed within this folder) with .sde connections that match what's in the "Source Data" column of the [query layers spreadsheet](https://docs.google.com/a/utah.gov/spreadsheet/ccc?key=0Aqee4VOgQcXcdG9DQzFEYld6UUtWRU1kNG5PMWVEY1E#gid=0)
- `__init__.py` with valid google drive credentials
- check `dev.py` or `prod.py` in `settings` to make sure that the paths are correct and that you have created a `DEQEnviro.gdb` geodatabase.
- run `main.py`
- You can also run `update_fdgb.py` and `update_sgid.py` with an option parameter specifying only one layer for testing purposes.