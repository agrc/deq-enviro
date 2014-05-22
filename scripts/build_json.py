import gspread
import ConfigParser
import os
import json
import requests

queryLayersUrl = 'https://docs.google.com/a/utah.gov/spreadsheet/ccc?key=0Aqee4VOgQcXcdG9DQzFEYld6UUtWRU1kNG5PMWVEY1E&usp=drive_web#gid=0'
mapServiceJson = 'http://localhost/arcgis/rest/services/DEQEnviro/MapServer?f=json'

# query layer spreadsheet column headers
fldName = 'Name'
fldDescription = 'Layer Description'
fldMetaData = 'Metadata Link'
fldHeading = 'Division Heading'
fldSGIDFCName = 'SGID Feature Class Name'

# property names that I want to access from update_data
workspace = 'Workspace'
fcName = 'fcName'

# five main fields
fldID = 'ID'
fldNAME = 'NAME'
fldADDRESS = 'ADDRESS'
fldCITY = 'CITY'
fldTYPE = 'TYPE'

qlFields = [
          [fldName, 'name'], 
          [fldDescription, 'description'], 
          [fldMetaData, 'metaDataUrl'], 
          [fldHeading, 'heading'],
          [fldID, fldID],
          [fldNAME, fldNAME],
          [fldADDRESS, fldADDRESS],
          [fldCITY, fldCITY],
          [fldTYPE, fldTYPE],
          [workspace, workspace],
          [fldSGIDFCName, fcName]
          ]

# other link fields
fldID = 'ID'
fldLinkDescription = 'Description'
fldURL = 'URL'

linksFields = [
               [fldID, 'id'],
               [fldLinkDescription, 'description'],
               [fldURL, 'url']
               ]

webdata = r'C:\MapData\webdata' # dev & test
# webdata = r'\\172.16.17.57\ArcGISServer\data\webdata' # production
jsonFile = os.path.join(webdata, 'DEQEnviro.json')

def getWorksheetData(wksh, fields):
    data = []
    fieldIndices = {}
    firstRow = True
    for row in wksh.get_all_values():
        if firstRow:
            # get field indices
            i = 0
            for cell in row:
                fieldIndices[cell] = i
                i = i + 1
                
            firstRow = False
            continue
        
        o = {}
        for f in fields:
            o[f[1]] = row[fieldIndices[f[0]]].strip()
        data.append(o)
    
    return data

def run():
    # get secrets
    config = ConfigParser.RawConfigParser()
    config.read('secrets.cfg')
    section = 'Google Drive Credentials'
    username = config.get(section, 'username')
    password = config.get(section, 'password')
    
    gc = gspread.login(username, password)
    spreadsheet = gc.open_by_url(queryLayersUrl)
    
    # query layers worksheet
    qlWksht = spreadsheet.worksheet('Query Layers')
    layers = getWorksheetData(qlWksht, qlFields)
    
    # get layer indecies from map service
    layersJson = requests.get(mapServiceJson).json()['layers']
    serviceLayers = {}
    for s in layersJson:
        serviceLayers[s['name']] = s['id']
    for l in layers:
        n = l[fcName].split('.')[-1]
        if n in serviceLayers.keys():
            l['index'] = serviceLayers[n]
    
    # other links
    linksWksht = spreadsheet.worksheet('Other Links')
    links = getWorksheetData(linksWksht, linksFields)
    linksDict = {}
    for l in links:
        linksDict[l[linksFields[0][1]]] = l
        
    j = json.dumps({'queryLayers': layers,
                    'otherLinks': linksDict}, indent=4)
    f = open(jsonFile, 'w')
    print >> f, j
    f.close()

    print('.json file completed')
    
    return layers