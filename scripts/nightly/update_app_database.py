'''
update_app_database.py

Helper code for updating data in the application file geodatabase
'''
import spreadsheet
from update_sgid import period_replacement
from update_fgdb import commonFields
import settings
from os import path
import arcpy
import logging
from forklift.models import Crate
from forklift.core import hash_field


temp_suffix = '_temp'
logger = logging.getLogger('forklift')
errors = []
wgs = arcpy.SpatialReference(4326)
latitudeLongitude = ['LONGITUDE', 'LATITUDE']
eastingNorthing = ['EASTING', 'NORTHING']
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
                 'Shape_Area',
                 hash_field}
truncateFields = [['PROJDESC', 2000]]


def get_crate_infos(destination_gdb, test_layer=None):
    return _get_crate_infos(destination_gdb, test_layer)


def _get_crate_infos(destination_gdb, test_layer=None, temp=False):
    infos = []
    for dataset in spreadsheet.get_datasets():
        try:
            #: skip if using test_layer and it's not the current layer
            if test_layer and dataset[settings.fieldnames.sgidName] != test_layer:
                continue

            sgid_name = dataset[settings.fieldnames.sgidName]
            source_data = dataset[settings.fieldnames.sourceData]

            #: don't worries about <static> data
            if source_data.startswith('<static>'):
                continue

            #: prepend path to database folder for database sources
            if not source_data.startswith(r'\\'):
                source_data = path.join(settings.dbConnects, source_data)

            is_table = arcpy.da.Describe(source_data)['datasetType'] == 'Table'
            if temp:
                if not is_table:
                    continue
            else:
                if is_table:
                    continue

            #: only try to update rows with valid data sources
            if not source_data.startswith('<'):
                source = path.join(settings.dbConnects, source_data)

                infos.append((path.basename(source),
                                path.dirname(source),
                                destination_gdb,
                                sgid_name.split('.')[-1]))

        except Exception as e:
            msg = 'Error with {}: {}'.format(dataset, e)
            errors.append(msg)
            logger.error(msg)
    return (infos, errors)

def get_temp_crate_infos(temp_gdb, test_layer=None):
    return _get_crate_infos(temp_gdb, test_layer, temp=True)

def start_etl(crates, app_database):
    #: these crates are all table -> point etls as returned from get_temp_crate_infos
    def get_spreadsheet_config_from_crate(crate):
        for config in spreadsheet.get_datasets():
            if crate.source.rstrip(temp_suffix).endswith(config[settings.fieldnames.sourceData].split('.')[-1]):
                return config
        raise Exception('{} not found in spreadsheet!'.format(crate.source))

    #: ETL tables to points into app database
    updated_datasets = []
    for crate in crates:
        dataset = get_spreadsheet_config_from_crate(crate)
        sgid_name = dataset[settings.fieldnames.sgidName]
        source_name = dataset[settings.fieldnames.sourceData]

        if not sgid_name.startswith('SGID10') or source_name.startswith('<') or not crate.was_updated():
            continue

        logger.info(sgid_name)
        logger.debug(crate)
        #: should always be table -> point feature class
        app_feature_class = path.join(app_database, sgid_name.split('.')[-1])

        if not arcpy.Exists(app_feature_class):
            arcpy.management.CreateFeatureclass(path.dirname(app_feature_class),
                                                path.basename(app_feature_class),
                                                'POINT',
                                                path.join(settings.sgid[sgid_name.split('.')[1]], sgid_name),
                                                spatial_reference=wgs)

        common_fields, mismatch_fields = compare_field_names(get_field_names(crate.destination), get_field_names(app_feature_class))

        if len(mismatch_fields) > 0:
            msg = '\n\nField mismatches between {} & {}: \n{}'.format(path.basename(app_feature_class), source_name, mismatch_fields)
            logger.error(msg)
            crate.set_result((Crate.INVALID_DATA, msg))
            continue

        app_fields = ['SHAPE@XY'] + common_fields
        source_fields = get_source_fields(common_fields)

        etl(app_feature_class, app_fields, crate.destination, source_fields)

        updated_datasets.append(sgid_name)

    return updated_datasets


def etl(dest, destFields, source, sourceFields):
    arcpy.management.TruncateTable(dest)

    where = '{} IS NOT NULL AND {} IS NOT NULL'.format(sourceFields[0], sourceFields[1])
    with arcpy.da.Editor(path.dirname(dest)), arcpy.da.InsertCursor(dest, destFields) as icursor, arcpy.da.SearchCursor(source, sourceFields, where) as scursor:
        for row in scursor:
            row = list(row)
            # use xy fields to create the point in feature class
            if sourceFields[0] == latitudeLongitude[0]:
                # project points from ll to wgs
                lng = float(row[0])
                lat = float(row[1])
                if lng < 0 and lat > 0:
                    pnt = arcpy.Point()
                    pnt.X = lng
                    pnt.Y = lat
                    pntGeo = arcpy.PointGeometry(pnt, wgs)
                    pntProj = pntGeo.projectAs(wgs)
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


def get_field_names(ds):
    return set([f.name for f in arcpy.ListFields(ds)])


def compare_field_names(source, sgid):
    # returns a list containing:
    # [<common fields>, <mismatches>]
    def upper(a):
        return set([s.upper() for s in a])

    sgid = upper(sgid)
    source = upper(source)
    mismatchedFields = list((sgid ^ source) - upper(excludeFields) - upper(commonFields))

    common_fields = list(set(sgid & source))

    return (common_fields, mismatchedFields)


def scrub_coord(value):
    if isinstance(value, (int, float)):
        return value
    else:
        return float(value.replace(',', '').strip())
