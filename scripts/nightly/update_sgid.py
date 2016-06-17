#!/usr/bin/env python
# * coding: utf8 *
'''
update_sgid.py

handles updating data in SGID from the various data sources
performs ETL process if necessary
'''


import arcpy
import logging
import spreadsheet
import settings
from forklift.models import Crate
from settings import fieldnames
from os import path

excludeFields = {'GlobalID',
                 'POSTTONET',
                 'Shape',
                 'SHAPE',
                 'OBJECTID',
                 'FID',
                 'Shape.len',
                 'Shape.area',
                 'Shape.STArea()',
                 'Shape.STLength()',
                 'Shape_Length',
                 'Shape_Area'}
latitudeLongitude = ['LONGITUDE', 'LATITUDE']
eastingNorthing = ['EASTING', 'NORTHING']
utm = arcpy.SpatialReference(26912)
wgs = arcpy.SpatialReference(4326)

#: [<field name>, <max length>]
truncateFields = [['PROJDESC', 2000]]
logger = logging.getLogger('forklift')
errors = []


def _get_crate_infos(test_layer=None, temp=False):
    infos = []
    for dataset in spreadsheet.get_datasets():
        #: skip if using test_layer and it's not the current layer
        if test_layer and dataset[fieldnames.sgidName] != test_layer:
            continue

        sgidName = dataset[fieldnames.sgidName]
        sourceData = dataset[fieldnames.sourceData]

        #: only try to update rows with valid sgid names and data sources
        if sgidName.startswith('SGID10') and not sourceData.startswith('<'):
            sgid = settings.sgid[sgidName.split('.')[1]]
            source = path.join(settings.dbConnects, sourceData)

            sgidType = arcpy.Describe(path.join(sgid, sgidName)).datasetType
            sourceType = arcpy.Describe(source).datasetType

            if temp is False:
                if sourceType == sgidType:
                    infos.append((path.basename(source),
                                  path.dirname(source),
                                  sgid,
                                  sgidName))
            else:
                if sourceType != sgidType:
                    infos.append((path.basename(source),
                                  path.dirname(source),
                                  settings.tempPointsGDB,
                                  path.basename(source).split('.')[-1]))

    return infos


def get_crate_infos(test_layer=None):
    return _get_crate_infos(test_layer)


def get_temp_crate_infos(test_layer=None):
    return _get_crate_infos(test_layer, temp=True)


def start_etl(crate_results):
    #: ETL tables to points into SGID
    for dataset in spreadsheet.get_datasets():
        sgidName = dataset[fieldnames.sgidName]
        sourceName = dataset[fieldnames.sourceData]

        #: skip if using test_layer and it's not the current layer
        if (sgidName.startswith('SGID10') and not sourceName.startswith('<')) or crate_results[sourceName] != Crate.UPDATED:
            continue

        #: should always be table -> point feature class
        source = path.join(settings.tempPointsGDB, sourceName)
        sgid = path.join(settings.sgid[sgidName.split('.')[1]], sgidName)
        commonFields = compare_field_names(get_field_names(source, get_field_names(sgid)))
        sgid_template = path.join(settings.sgid[sgidName.split('.')[1]], sgidName)
        sgidScratch = arcpy.CreateFeatureclass_management(arcpy.env.scratchGDB,
                                                          r'/{}'.format(sgidName.split('.')[-1]),
                                                          "#",
                                                          sgid_template)
        sgidFields = ['SHAPE@XY'] + commonFields
        sourceFields = get_source_fields(commonFields)

        etl(sgidScratch, sgidFields, source, sourceFields)

        update_sgid_data(sgidScratch, sgid)


def etl(dest, destFields, source, sourceFields):
    logger.info('ETL needed')
    where = '{} IS NOT NULL AND {} IS NOT NULL'.format(sourceFields[0], sourceFields[1])
    if source.split('\\')[-1].startswith('TEMPO'):
        where = None
    with arcpy.da.InsertCursor(dest, destFields) as icursor:
        # da.SearchCursor throws errors if we pass in sourceFields on data from daq.odc
        # this is my work-around
        scursor = arcpy.SearchCursor(source, where)
        for orig_row in scursor:
            # create new list with data in correct order
            row = []
            for fn in sourceFields:
                row.append(orig_row.getValue(fn))

            # use xy fields to create the point in feature class
            if sourceFields[0] == latitudeLongitude[0]:
                # project points from ll to utm
                lng = float(row[0])
                lat = float(row[1])
                if lng < 0 and lat > 0:
                    pnt = arcpy.Point()
                    pnt.X = lng
                    pnt.Y = lat
                    pntGeo = arcpy.PointGeometry(pnt, wgs)
                    pntProj = pntGeo.projectAs(utm)
                    if pntProj.firstPoint is not None:
                        x = pntProj.firstPoint.X
                        y = pntProj.firstPoint.Y
                    else:
                        continue
                else:
                    continue
            else:
                if row[0] is not None and row[1] is not None:
                    try:
                        x = scrub_coord(row[0])
                        y = scrub_coord(row[1])
                    except ValueError:
                        continue
                else:
                    continue

            # some fields need to be truncated
            for tf in truncateFields:
                fName = tf[0]
                maxLength = tf[1]
                if fName in sourceFields:
                    i = sourceFields.index(fName)
                    value = row[i]
                    if value is not None:
                        row[i] = row[i][:maxLength]

            icursor.insertRow([(x, y)] + row[2:])

        del scursor


def scrub_coord(value):
    if isinstance(value, (int, long, float)):
        return value
    else:
        return float(value.replace(',', '').strip())


def get_source_fields(commonFields):
    # add duplicate xy fields to the start of the list so that we can
    # use them to create points later
    upper = [f.upper() for f in commonFields]

    if set(eastingNorthing).issubset(upper):
        xy = [commonFields[upper.index(eastingNorthing[0])],
              commonFields[upper.index(eastingNorthing[1])]]
    else:
        xy = latitudeLongitude
    return list(xy) + commonFields


def update_sgid_data(source, destination):
    arcpy.TruncateTable_management(destination)
    arcpy.Append_management(source, destination, 'NO_TEST')


def compare_field_names(source, sgid):
    # returns a list containing:
    # [<source fields>, <sgid fields>, <mismatches>]
    def upper(a):
        return set([s.upper() for s in a])
    mismatchedFields = list((upper(sgid) ^ upper(source)) - upper(excludeFields))

    l = list(set(sgid & source))

    return (l, mismatchedFields)


def get_field_names(ds):
    return set([f.name for f in arcpy.ListFields(ds)])
