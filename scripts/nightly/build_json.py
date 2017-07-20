'''
build_json.py

A module that builds DEQEnviro.json that is used to confire the web app on load.
'''

import os
import requests
import spreadsheet
from settings import fieldnames
import settings
from agrc.agrc import ags
import json

jsonFile = os.path.join(settings.webdata, 'DEQEnviro.json')


def run():
    layers = get_dataset_info(spreadsheet.get_query_layers())
    tables = get_dataset_info(spreadsheet.get_related_tables())

    # other links
    links = spreadsheet.get_links()
    linksDict = {}
    for l in links:
        linksDict[l[fieldnames.ID]] = l

    j = {fieldnames.queryLayers: layers,
         fieldnames.relatedTables: tables,
         fieldnames.otherLinks: linksDict}
    with open(jsonFile, 'w') as f:
        json.dump(j, f)

    return j


def get_dataset_info(spreadsheetData):
    admin = ags.AGSAdmin(settings.DEQNIGHTLY_USER, settings.DEQNIGHTLY_PASSWORD, settings.agsServer)

    # get layer indicies from map service
    jsonData = requests.get(settings.mapServiceJson).json()
    secureJsonData = requests.get('{}&token={}'.format(settings.securedServiceJson, admin.token)).json()

    # apply s to secure ids
    for l in secureJsonData['layers']:
        l['id'] = 's' + str(l['id'])

    layersAndTables = jsonData['layers'] + jsonData['tables'] + secureJsonData['layers']
    serviceLayers = {}
    for s in layersAndTables:
        serviceLayers[s['name']] = str(s['id'])
    for l in spreadsheetData:
        n = l[fieldnames.sgidName].split('.')[-1]
        l[fieldnames.fields] = parse_fields(l[fieldnames.fields])
        if n in list(serviceLayers.keys()):
            l[fieldnames.index] = serviceLayers[n]

    return spreadsheetData


def parse_fields(fieldTxt):
    fields = []
    for txt in fieldTxt.split(', '):
        splitIndex = txt.find(' (')
        fieldname = txt[:splitIndex].strip()
        alias = txt[splitIndex + 2:-1].strip()
        if fieldname is not None and fieldname != '' and alias is not None and alias != '':
            fields.append([fieldname, alias])

    return fields


if __name__ == '__main__':
    run()
