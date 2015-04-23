Deploy Steps
============

- Deploy nightly script to .56
- Publish map and gp services (see note below)
- Create deqnightly (used in scripts/nightly/build_json.py) user in ArcGIS Server and give writes to both map services
- Set up UserManagement on .53 and add roles to Secure map service
- Deploy Search API
- Deploy SOE
- Set up enviro.deq.utah.gov website on .53
- Push web app

### Other deploy notes

To publish the `ExportWebMap` service follow [these steps](http://resources.arcgis.com/en/help/main/10.2/index.html#//00570000009s000000).
- Templates folder is `maps\PrintTemplates` (not a registered folder with the server).
- Default template is `Portrait.mxd`
- Synchronous

`Toolbox` gp task requires the `xlsxwriter` python package.

If the `webdata` folder (see `src/app/config.js`) is within the root application folder on the server then you need to make it a virtual directory for permissions to work.

After creating the application in permissions proxy add the following property to the admin users so that they can log in:
```
"AdditionalSerialized": "{\"phone\":\"\",\"address\":\"\",\"city\":\"\",\"state\":\"\",\"zip\":\"\"}",
"AccessRules": {
    "StartDate": 0,
    "EndDate": 5000000000000,
    "OptionsSerialized": "{\"counties\":[\"STATEWIDE\"],\"locationTxt\":\"undefined\",\"layers\":[\"s0\",\"s3\",\"s1\",\"s2\"]}"
  }
```
