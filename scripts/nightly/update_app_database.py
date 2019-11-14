'''
update_app_database.py

Helper code for updating data in the application file geodatabase
'''
import spreadsheet
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
utm = arcpy.SpatialReference(26912)
merc = arcpy.SpatialReference(3857)
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


def get_related_table_crate_infos(destination_gdb, test_layer=None):
    return _get_crate_infos(destination_gdb, test_layer, related_tables=True)


def get_non_sgid_crate_infos(destination_gdb, test_layer=None):
    return _get_crate_infos(destination_gdb, test_layer, non_sgid=True)


def _get_crate_infos(destination_gdb, test_layer=None, temp=False, related_tables=False, non_sgid=False):
    if related_tables:
        datasets = spreadsheet.get_related_tables()
    else:
        datasets = spreadsheet.get_query_layers()

    infos = []
    for dataset in datasets:
        try:
            #: skip if using test_layer and it's not the current layer
            sgid_name = dataset[settings.fieldnames.sgidName]
            if test_layer and sgid_name != test_layer:
                continue

            if non_sgid:
                if not sgid_name.startswith('DirectFrom'):
                    continue
            else:
                if sgid_name.startswith('DirectFrom'):
                    continue

            source_data = dataset[settings.fieldnames.sourceData]

            #: don't worries about <static> data
            if source_data.startswith('<static>'):
                continue

            #: prepend path to database folder for database sources
            if not source_data.startswith(r'\\'):
                source_data = path.join(settings.dbConnects, source_data)

            if not related_tables:
                is_table = arcpy.da.Describe(source_data)['datasetType'] == 'Table'
                if temp:
                    if not is_table:
                        continue
                else:
                    if is_table:
                        continue

            #: only try to update data with valid data sources
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
        for config in spreadsheet.get_query_layers():
            if crate.source.endswith(config[settings.fieldnames.sourceData].split('.')[-1]):
                return config
        raise Exception('{} not found in spreadsheet!'.format(crate.source))

    #: ETL tables to points into app database
    updated_datasets = []
    for crate in crates:
        dataset = get_spreadsheet_config_from_crate(crate)
        sgid_name = dataset[settings.fieldnames.sgidName]
        source_name = dataset[settings.fieldnames.sourceData]

        if not sgid_name.startswith('SGID') or source_name.startswith('SGID') or not crate.was_updated():
            continue

        logger.info(sgid_name)
        logger.debug(crate)

        #: The reason why I am creating a temp feature class to load data into rather than loading it directly
        #: into the prod feature class is this:
        #: When attempting to use arcpy.da.InsertCursor in etl() to insert directly into the prod feature classes
        #: arcpy choked on the ones that participate in relationship classes saying that it required an edit session.
        #: However, when I added an edit session with arcpy.da.Editor, it caused some very strange behavior with the
        #: point geometries. It would make all of the point geometries the same as the last point (in batches of 1000).
        #: The only work-around that I found was to etl into temp feature classes and then use the Append tool to load
        #: the data into the prod feature classes.
        app_feature_class = path.join(app_database, sgid_name.split('.')[-1])
        temp_app_feature_class = path.join(crate.destination_workspace, sgid_name.split('.')[-1] + '_temp')

        if not arcpy.Exists(temp_app_feature_class):
            arcpy.management.CreateFeatureclass(path.dirname(temp_app_feature_class),
                                                path.basename(temp_app_feature_class),
                                                'POINT',
                                                path.join(settings.sgid[sgid_name.split('.')[1]], sgid_name),
                                                spatial_reference=merc)

        common_fields, mismatch_fields = compare_field_names(get_field_names(crate.destination),
                                                             get_field_names(temp_app_feature_class))

        if len(mismatch_fields) > 0:
            msg = '\n\nField mismatches between {} & {}: \n{}'.format(path.basename(temp_app_feature_class),
                                                                      source_name,
                                                                      mismatch_fields)
            logger.error(msg)
            crate.set_result((Crate.INVALID_DATA, msg))
            continue

        app_fields = ['SHAPE@XY'] + common_fields
        source_fields = get_source_fields(common_fields)

        etl(temp_app_feature_class, app_fields, crate.destination, source_fields)
        if not arcpy.Exists(app_feature_class):
            arcpy.management.Copy(temp_app_feature_class, app_feature_class)
        else:
            arcpy.management.TruncateTable(app_feature_class)

        arcpy.management.Append(temp_app_feature_class, app_feature_class, 'NO_TEST')

        updated_datasets.append(sgid_name)

    return updated_datasets


def etl(dest, destFields, source, sourceFields):
    arcpy.management.TruncateTable(dest)

    where = '{} IS NOT NULL AND {} IS NOT NULL'.format(sourceFields[0], sourceFields[1])
    with arcpy.da.InsertCursor(dest, destFields) as icursor, \
            arcpy.da.SearchCursor(source, sourceFields, where) as scursor:
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
                    pntProj = pntGeo.projectAs(merc)
                    if pntProj.firstPoint is not None:
                        x = pntProj.firstPoint.X
                        y = pntProj.firstPoint.Y
                    else:
                        continue
                else:
                    continue
            else:
                # project points from utm to mercator
                if row[0] is not None and row[1] is not None:
                    try:
                        scrubbed_x = scrub_coord(row[0])
                        scrubbed_y = scrub_coord(row[1])
                    except ValueError:
                        continue

                    pnt = arcpy.Point()
                    pnt.X = scrubbed_x
                    pnt.Y = scrubbed_y
                    pntGeo = arcpy.PointGeometry(pnt, utm)
                    pntProj = pntGeo.projectAs(merc)
                    if pntProj.firstPoint is not None:
                        x = pntProj.firstPoint.X
                        y = pntProj.firstPoint.Y
                    else:
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

            new_values = [(x, y)] + row[2:]
            icursor.insertRow(new_values)


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
