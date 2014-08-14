# in charge of parsing and returning data from the query layers spreadsheet
# which confusingly has more than just query layers data in it. :)

import gspread
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
    ['Additional Information', fieldnames.additionalLink]
]

tblFields = [
    ['Tab Name', fieldnames.name],
    ['Source Data', fieldnames.sourceData],
    ['SGID Table Name', fieldnames.sgidName],
    ['Fields', fieldnames.fields],
    ['Additional Information', fieldnames.additionalLink]
]

linksFields = [
    [fieldnames.ID, fieldnames.ID],
    ['Description', fieldnames.description],
    ['URL', fieldnames.url]
]


gc = gspread.login(settings.GOOGLE_USER, settings.GOOGLE_PASSWORD)
spreadsheet = gc.open_by_url(settings.queryLayersUrl)


def get_query_layers():
    return _get_worksheet_data(spreadsheet.worksheet('Query Layers'), qlFields)

def get_related_tables():
    return _get_worksheet_data(spreadsheet.worksheet('Related Tables'), tblFields)

def get_links():
    return _get_worksheet_data(spreadsheet.worksheet('Other Links'), linksFields)
    
def get_datasets():
    # return all querylayers and tables
    return get_query_layers() + get_related_tables()

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
