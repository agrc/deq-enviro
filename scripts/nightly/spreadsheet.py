# in charge of parsing and returning data from the query layers spreadsheet
# which confusingly has more than just query layers data in it. :)

import gspread
import json
from oauth2client.client import SignedJwtAssertionCredentials
from settings import fieldnames
import settings


qlFields = [
    #[<spreadsheet header name>, <result object property name>]
    ['Name', fieldnames.name],
    ['Layer Description', fieldnames.description],
    ['Metadata Link', fieldnames.metaDataUrl],
    [fieldnames.ID, fieldnames.ID],
    ['Division Heading', fieldnames.heading],
    [fieldnames.NAME, fieldnames.NAME],
    [fieldnames.ADDRESS, fieldnames.ADDRESS],
    [fieldnames.CITY, fieldnames.CITY],
    [fieldnames.TYPE, fieldnames.TYPE],
    ['Source Data', fieldnames.sourceData],
    ['SGID Feature Class Name', fieldnames.sgidName],
    ['Geometry Type', fieldnames.geometryType],
    ['Identify Attributes', fieldnames.fields],
    ['Document Search', fieldnames.docLink],
    ['GRAMA Request', fieldnames.gramaLink],
    ['Additional Information', fieldnames.additionalLink],
    ['Map Label Field', fieldnames.ENVIROAPPLABEL],
    ['Secure', fieldnames.secure],
    ['Special Filters', fieldnames.specialFilters],
    ['Special Filter Default To On', fieldnames.specialFiltersDefaultOn],
    ['Additional Searches', fieldnames.additionalSearches],
    ['Custom Symbology Field', fieldnames.ENVIROAPPSYMBOL],
    ['Sort Field', fieldnames.sortField],
    ['Related Tables', fieldnames.relatedTables]
]

tblFields = [
    ['Tab Name', fieldnames.name],
    ['Source Data', fieldnames.sourceData],
    ['SGID Table Name', fieldnames.sgidName],
    ['Fields', fieldnames.fields],
    ['Additional Information', fieldnames.additionalLink],
    ['Additional Information Link Fields', fieldnames.additionalLinkFields]
]

rlFields = [
    ['SGID Feature Class Name', fieldnames.sgidName],
    ['Source Data', fieldnames.sourceData]
]

linksFields = [
    [fieldnames.ID, fieldnames.ID],
    ['Description', fieldnames.description],
    ['URL', fieldnames.url]
]


def _login():
    # had to login everytime because the session was being closed
    json_key = json.load(open('settings/oauth2key.json'))
    scope = ['https://spreadsheets.google.com/feeds']
    credentials = SignedJwtAssertionCredentials(
        json_key['client_email'],
        json_key['private_key'],
        scope)
    gc = gspread.authorize(credentials)
    return gc.open_by_url(settings.queryLayersUrl)

def get_query_layers():
    return _get_worksheet_data(_login().worksheet('Query Layers'), qlFields)

def get_related_tables():
    return _get_worksheet_data(_login().worksheet('Related Tables'), tblFields)

def get_reference_layers():
    return _get_worksheet_data(_login().worksheet('Reference Layers'), rlFields)

def get_links():
    return _get_worksheet_data(_login().worksheet('Other Links'), linksFields)
    
def get_datasets():
    # return all querylayers, tables, and reference layers
    return get_query_layers() + get_related_tables() + get_reference_layers()

def _get_worksheet_data(wksh, fields):
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
