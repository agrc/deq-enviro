'''
update_app_database.py

Helper code for updating data in the application file geodatabase
'''
import logging
from os import path
import os

import arcpy
from arcgis.features import FeatureLayer, GeoAccessor
import requests
from forklift.core import hash_field
from forklift.models import Crate

import settings
import spreadsheet
from update_fgdb import commonFields

temp_suffix = '_temp'
logger = logging.getLogger('forklift')
errors = []
wgs = arcpy.SpatialReference(4326)
utm = arcpy.SpatialReference(26912)
merc = arcpy.SpatialReference(3857)
EASTING = 'easting'
NORTHING = 'northing'
LONGITUDE = 'longitude'
LATITUDE = 'latitude'
X_FIELDS = [LONGITUDE, EASTING]
Y_FIELDS = [LATITUDE, NORTHING]
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

def get_source_name_and_workspace(source_data):
    # feature services
    if source_data.startswith('https'):
        if '/services/' in source_data:
            [source_workspace, source_name] = source_data.split(r'/services/')
            source_workspace = fr'{source_workspace}/services/'
        else:
            #: this is for the web-hosted txt files for air quality
            name = source_data.split("/")[-1].split(".")[0]
            local_copy = path.join(arcpy.env.scratchGDB, name)
            logger.info(f"copying {source_data} to {local_copy}")

            #: download to a local file because arcpy doesn't like grabbing the data directly from a URL
            response = requests.get(source_data)
            response.raise_for_status()
            temp_file = path.join(arcpy.env.scratchFolder, "temp.tsv")
            with open(temp_file, "w") as file:
                file.write(response.text)

            if arcpy.Exists(local_copy):
                arcpy.management.Delete(local_copy)
            arcpy.management.CopyRows(temp_file, local_copy)
            source_workspace = arcpy.env.scratchGDB
            source_name = name

            #: fix field types and names that have been altered by the download
            for field in arcpy.da.Describe(local_copy)["fields"]:
                if field.name.endswith("_"):
                    field_type = (
                        "DATE"
                        if field.name == "Date__"
                        else "DOUBLE"
                        if field.name in ["Longitude_", "Latitude_"]
                        else field.type
                    )
                    new_field_name = field.name[:-1]
                    logger.info(
                        f"updating {field.name} in {local_copy} to {new_field_name} ({field_type})"
                    )
                    arcpy.management.AddField(local_copy, new_field_name, field_type)
                    arcpy.management.CalculateField(
                        local_copy, new_field_name, f"!{field.name}!", "PYTHON3"
                    )
                    arcpy.management.DeleteField(local_copy, field.name)

            # clean up temp file
            os.remove(temp_file)

    #: prepend path to database folder for database sources
    else:
        if not source_data.startswith(r'\\'):
            source_data = path.join(settings.dbConnects, source_data)

        source_workspace = path.dirname(source_data)
        source_name = path.basename(source_data)

    return [source_workspace, source_name]


def _get_crate_infos(destination_gdb, test_layer=None, temp=False, related_tables=False):
    if related_tables:
        datasets = spreadsheet.get_related_tables()
    else:
        datasets = spreadsheet.get_query_layers()

    infos = []
    for dataset in datasets:
        try:
            #: skip if using test_layer and it's not the current layer
            sgid_name = dataset[settings.fieldnames.sgidName]
            logger.debug(f'processing {sgid_name}')
            if test_layer and sgid_name != test_layer:
                continue

            if sgid_name.startswith('DirectFrom'):
                continue

            source_data = dataset[settings.fieldnames.sourceData]

            if source_data == '':
                logger.warning(f'No source data for {sgid_name}')
                continue

            #: don't worries about <static> data
            if source_data.startswith('<static>'):
                continue

            [source_workspace, source_name] = get_source_name_and_workspace(source_data)

            if not related_tables:
                is_table = arcpy.da.Describe(path.join(source_workspace, source_name))['datasetType'] == 'Table'
                if temp:
                    if not is_table:
                        continue
                else:
                    if is_table:
                        continue

            infos.append((source_name,
                            source_workspace,
                            destination_gdb,
                            sgid_name.split('.')[-1]))

        except Exception as e:
            msg = 'Error with {}: {}'.format(dataset, e)
            errors.append(msg)
            logger.error(msg)
    return (infos, errors)


def get_temp_crate_infos(temp_gdb, test_layer=None):
    return _get_crate_infos(temp_gdb, test_layer, temp=True)


def get_spreadsheet_configs_for_crates(crates):
    #: returns [[spreadsheet_config, crate]]

    def get_source_from_crate(crate):
        #: handle crates that are objects (during lift) or dictionaries (during ship)
        try:
            return crate.source
        except AttributeError:
            return crate['source']

    def get_was_updated(crate):
        try:
            return crate.was_updated()
        except AttributeError:
            return crate['was_updated']

    def get_spreadsheet_config_from_crate(crate):
        for config in spreadsheet.get_query_layers():
            source_data = config[settings.fieldnames.sourceData]
            source_name = get_source_name_and_workspace(source_data)[1]
            if len(source_data) > 0 and get_source_from_crate(crate).endswith(source_name):
                return config
        raise Exception('{} not found in spreadsheet!'.format(get_source_from_crate(crate)))

    updated_crates = []

    for crate in crates:
        spreadsheet_config = get_spreadsheet_config_from_crate(crate)
        sgid_name = spreadsheet_config[settings.fieldnames.sgidName]
        source_name = spreadsheet_config[settings.fieldnames.sourceData]

        if (not sgid_name.startswith('SGID') and not sgid_name.startswith('ETLFrom')) or source_name.startswith('SGID') or not get_was_updated(crate):
            continue

        updated_crates.append([spreadsheet_config, crate])

    return updated_crates

def start_etl(crates, app_database):
    #: these crates are all table -> point etls as returned from get_temp_crate_infos
    #: ETL tables to points into app database
    updated_datasets = []
    for config, crate in get_spreadsheet_configs_for_crates(crates):
        sgid_name = config[settings.fieldnames.sgidName]
        source_name = config[settings.fieldnames.sourceData]
        logger.info(sgid_name)
        logger.debug(crate)

        app_feature_class = path.join(app_database, sgid_name.split('.')[-1])

        try:
            if config[settings.fieldnames.etlType] == 'drinking_water_join':
                drinking_water_join(crate, app_feature_class)
            else:
                #: default to table to points
                table_to_points(crate, app_feature_class, source_name, sgid_name)
        except MismatchingFields:
            continue

        updated_datasets.append(sgid_name)

    return updated_datasets


def drinking_water_join(crate, app_feature_class):
    culinary_join_field = 'DWSYSNUM'
    culinary_water_feature_layer = r'https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/CulinaryWaterServiceAreas/FeatureServer/0'

    logger.info('loading data into culinary water dataframe')
    culinary_water_df = GeoAccessor.from_layer(FeatureLayer(culinary_water_feature_layer))

    logger.info('dropping unused fields')
    preserve_fields = ['COUNTY', 'SHAPE']
    culinary_water_df.set_index(culinary_join_field, inplace=True)
    drop_fields = [column for column in culinary_water_df.columns if column not in preserve_fields]
    culinary_water_df.drop(drop_fields, axis=1, inplace=True)

    logger.info('getting ratings data')
    ratings_df = GeoAccessor.from_table(crate.destination)

    logger.info('joining')
    joined_df = ratings_df.join(culinary_water_df, on='PWSID', how='inner')

    #: to_featureclass was throwing errors before this change
    joined_df['RATINGDATE'] = joined_df['RATINGDATE'].astype(str)

    logger.info('exporting data')
    joined_df.spatial.project(3857, transformation_name='NAD_1983_To_WGS_1984_5')
    joined_df.spatial.to_featureclass(app_feature_class, overwrite=True, sanitize_columns=False)


def table_to_points(crate, app_feature_class, source_name, sgid_name):
    #: The reason why I am creating a temp feature class to load data into rather than loading it directly
    #: into the prod feature class is this:
    #: When attempting to use arcpy.da.InsertCursor in etl() to insert directly into the prod feature classes
    #: arcpy choked on the ones that participate in relationship classes saying that it required an edit session.
    #: However, when I added an edit session with arcpy.da.Editor, it caused some very strange behavior with the
    #: point geometries. It would make all of the point geometries the same as the last point (in batches of 1000).
    #: The only work-around that I found was to etl into temp feature classes and then use the Append tool to load
    #: the data into the prod feature classes.
    temp_app_feature_class = path.join(crate.destination_workspace, sgid_name.split('.')[-1] + '_temp')

    if not arcpy.Exists(temp_app_feature_class):
        fields = get_field_names(crate.destination)

        x_field = None
        y_field = None
        for field in fields:
            if field.lower() in X_FIELDS:
                x_field = field
            elif field.lower() in Y_FIELDS:
                y_field = field

        if x_field is None or y_field is None:
            raise Exception(f'X nor Y fields could be found in {source_name}!')
        #: make sure that coord fields are numeric
        is_string = False
        for field in arcpy.da.Describe(crate.destination)['fields']:
            if field.name in [x_field, y_field] and field.type == 'String':
                is_string = True
        if is_string:
            #: make temp copy of table and then reload data
            temp = arcpy.management.CreateTable(crate.destination_workspace, f'{crate.destination_name}_xylayer', crate.destination)
            for field in [x_field, y_field]:
                arcpy.management.AlterField(temp, field, field_type='LONG')
            arcpy.management.Append(temp, crate.destination, schema_type='NO_TEST')
            xy_layer_source = temp
        else:
            xy_layer_source = crate.destination

        template = arcpy.management.MakeXYEventLayer(xy_layer_source, x_field, y_field, f'{sgid_name}_layer')

        arcpy.management.CreateFeatureclass(path.dirname(temp_app_feature_class),
                                            path.basename(temp_app_feature_class),
                                            'POINT',
                                            # path.join(settings.sgid[sgid_name.split('.')[1]], sgid_name),
                                            template,
                                            spatial_reference=merc)
        arcpy.management.Delete(template)

    common_fields, mismatch_fields = compare_field_names(get_field_names(crate.destination),
                                                            get_field_names(temp_app_feature_class))

    if len(mismatch_fields) > 0:
        msg = '\n\nField mismatches between {} & {}: \n{}'.format(path.basename(temp_app_feature_class),
                                                                    source_name,
                                                                    mismatch_fields)
        logger.error(msg)
        crate.set_result((Crate.INVALID_DATA, msg))

        raise MismatchingFields()

    app_fields = ['SHAPE@XY'] + common_fields
    source_fields = get_source_fields(common_fields)

    etl(temp_app_feature_class, app_fields, crate.destination, source_fields)

    if not arcpy.Exists(app_feature_class):
        arcpy.management.Copy(temp_app_feature_class, app_feature_class)
    else:
        arcpy.management.DeleteRows(app_feature_class)
        arcpy.management.Append(temp_app_feature_class, app_feature_class, 'NO_TEST')


def etl(dest, destFields, source, sourceFields):
    arcpy.management.DeleteRows(dest)

    where = '{} IS NOT NULL AND {} IS NOT NULL'.format(sourceFields[0], sourceFields[1])
    with arcpy.da.InsertCursor(dest, destFields) as icursor, \
            arcpy.da.SearchCursor(source, sourceFields, where) as scursor:
        for row in scursor:
            row = list(row)
            # use xy fields to create the point in feature class
            if sourceFields[0].lower() == LONGITUDE:
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
    fields = [f.lower() for f in commonFields]

    if EASTING in fields:
        xy = [commonFields[fields.index(EASTING)],
              commonFields[fields.index(NORTHING)]]
    else:
        xy = [LONGITUDE, LATITUDE]
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


class MismatchingFields(Exception):
    pass
