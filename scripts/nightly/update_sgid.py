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
                                  sgidName.split('.')[-1]))
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


def start_etl(crates):
    #: these crates are all table -> point etls as returned from get_temp_crate_infos
    def get_spreadsheet_config_from_crate(crate):
        for config in spreadsheet.get_datasets():
            if crate.source.endswith(config[fieldnames.sourceData]):
                return config
        raise Exception('{} not found in spreadsheet!'.format(crate.source))

    #: ETL tables to points into SGID
    for crate in crates:
        dataset = get_spreadsheet_config_from_crate(crate)
        sgidName = dataset[fieldnames.sgidName]
        sourceName = dataset[fieldnames.sourceData]

        if not sgidName.startswith('SGID10') or sourceName.startswith('<') or crate.result[0] not in [Crate.UPDATED, Crate.CREATED]:
            continue

        logger.info(sgidName)
        logger.debug(crate)
        #: should always be table -> point feature class
        sgid = path.join(settings.sgid[sgidName.split('.')[1]], sgidName)
        fields = compare_field_names(get_field_names(crate.destination), get_field_names(sgid))
        commonFields = fields[0]
        mismatchFields = fields[1]

        if len(mismatchFields) > 0:
            msg = '\n\nField mismatches between {} & {}: \n{}'.format(sgidName, sourceName, mismatchFields)
            logger.error(msg)
            crate.success[0] = False
            if crate.success[1] is None:
                crate.success[1] = [msg]
            else:
                crate.success[1].append(msg)
        temp_sgid_name = sgidName.split('.')[-1] + '_points'
        temp_sgid = path.join(settings.tempPointsGDB, temp_sgid_name)
        if arcpy.Exists(temp_sgid):
            arcpy.Delete_management(temp_sgid)
        arcpy.CreateFeatureclass_management(settings.tempPointsGDB,
                                            temp_sgid_name,
                                            "#",
                                            sgid,
                                            spatial_reference=utm)
        sgidFields = ['SHAPE@XY'] + commonFields
        sourceFields = get_source_fields(commonFields)

        etl(temp_sgid, sgidFields, crate.destination, sourceFields)

        update_sgid_data(temp_sgid, sgid)


def etl(dest, destFields, source, sourceFields):
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
