# in charge of parsing and returning data from the query layers spreadsheet
# which confusingly has more than just query layers data in it. :)

import gspread
from oauth2client.service_account import ServiceAccountCredentials
from settings import fieldnames
from os import path
import settings
import logging
from time import sleep


logger = logging.getLogger('forklift')
qlFields = [
    #: [<spreadsheet header name>, <result object property name>]
    ['Name', fieldnames.name],
    ['Layer Description', fieldnames.description],
    ['Metadata Link', fieldnames.metaDataUrl],
    ['OID Field', fieldnames.oidField],
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
    ['Related Tables', fieldnames.relatedTables],
    ['Legend Title', fieldnames.legendTitle],
    ['Coded Values', fieldnames.codedValues]
]

tblFields = [
    ['Tab Name', fieldnames.name],
    ['Source Data', fieldnames.sourceData],
    ['SGID Table Name', fieldnames.sgidName],
    ['Fields', fieldnames.fields],
    ['Additional Information', fieldnames.additionalLink],
    ['Additional Information Link Fields', fieldnames.additionalLinkFields],
    ['SGID Relationship Name', fieldnames.relationshipName],
    ['OID Field', fieldnames.oidField],
    ['Primary Key', fieldnames.primaryKey],
    ['Foreign Key', fieldnames.foreignKey],
    ['Parent Dataset Name', fieldnames.parentDatasetName]
]

rlFields = [
    ['SGID Feature Class Name', fieldnames.sgidName],
    ['Source Data', fieldnames.sourceData],
    ['Fields', fieldnames.fields]
]

linksFields = [
    [fieldnames.ID, fieldnames.ID],
    ['Description', fieldnames.description],
    ['URL', fieldnames.url]
]


def _login():
    logger.debug('logging into google spreadsheet')
    # had to login everytime because the session was being closed
    scope = ['https://spreadsheets.google.com/feeds']
    credentials = ServiceAccountCredentials.from_json_keyfile_name(path.join(path.dirname(__file__), 'settings', 'deq-enviro-key.json'), scope)
    gc = gspread.authorize(credentials)

    tries = 1

    while tries <= 3:
        try:
            sheet = gc.open_by_url(settings.queryLayersUrl)

            return sheet
        except Exception as ex:
            if tries == 3:
                raise ex

            logger.warn('login error, retrying...')
            sleep(30)

        tries = tries + 1


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
