# Builds a .json file used by the app. 
# Also returns lists used to update SDE and file geodatabase data.

import os
import json
import requests
import spreadsheet
from settings import fieldnames
import settings

jsonFile = os.path.join(settings.webdata, 'DEQEnviro.json')

def run():
    layers = spreadsheet.get_query_layers()
    
    # get layer indicies from map service
    layersJson = requests.get(settings.mapServiceJson).json()['layers']
    serviceLayers = {}
    for s in layersJson:
        serviceLayers[s['name']] = s['id']
    for l in layers:
        n = l[fieldnames.sgidName].split('.')[-1]
        l[fieldnames.fields] = parse_fields(l[fieldnames.fields])
        if n in serviceLayers.keys():
            l[fieldnames.index] = serviceLayers[n]

    # other links
    links = spreadsheet.get_links()
    linksDict = {}
    for l in links:
        linksDict[l[fieldnames.ID]] = l

    j = {fieldnames.queryLayers: layers,
                    fieldnames.otherLinks: linksDict}
    f = open(jsonFile, 'w')
    print >> f, json.dumps(j, indent=4)
    f.close()

    return j

def parse_fields(fieldTxt):
    fields = []
    for txt in fieldTxt.split(','):
        a = txt.strip().split(' (')
        if len(a) == 2:
            fields.append([a[0], a[1][:-1]])
    
    return fields

if __name__ == '__main__':
    run()
    print('done')