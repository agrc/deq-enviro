# in charge of parsing and returning data from the query layers spreadsheet
# which confusingly has more than just query layers data in it. :)

import logging
from os import path
from time import sleep, time

import pygsheets
import settings
from settings import fieldnames

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
    ['Permit Information', fieldnames.permitLink],
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
    ['OID Field', fieldnames.oidField]
]

linksFields = [
    [fieldnames.ID, fieldnames.ID],
    ['Description', fieldnames.description],
    ['URL', fieldnames.url]
]

credentials = path.join(path.dirname(__file__), 'settings', 'ut-dts-agrc-deq-enviro-prod-aecfbfdedcc3.json')
gc = None
sheet = None
authorize_time = None


def _login():
    global gc, sheet, authorize_time
    tries = 1
    max_tries = 10
    authorize_shelf_life = 600  #: 10 minutes

    while tries <= max_tries:
        try:
            if gc is None or authorize_time is None or time() - authorize_time > authorize_shelf_life:
                logger.debug('logging into google spreadsheet')
                authorize_time = time()
                gc = pygsheets.authorize(service_file=credentials)
                sheet = gc.open_by_url(settings.queryLayersUrl)

            return sheet
        except Exception as ex:
            if tries == max_tries:
                raise ex

            logger.warn('login error, retrying...')
            sleep(30)

        tries = tries + 1


def get_query_layers():
    return _get_worksheet_data(_login().worksheet('title', 'Query Layers'), qlFields)


def get_related_tables():
    return _get_worksheet_data(_login().worksheet('title', 'Related Tables'), tblFields)


def get_links():
    return _get_worksheet_data(_login().worksheet('title', 'Other Links'), linksFields)


def get_relationship_classes():
    return _login().worksheet('title', 'Relationship Classes').get_all_records()


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
