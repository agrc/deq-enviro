"""
A module for downloading data from enviro.deq.utah.gov feature services.
"""

import shutil
from pathlib import Path
from shapely import (
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    Point,
    Polygon,
)

import geopandas as gpd
from arcgis.features import (
    FeatureLayer,
    FeatureSet,
)
from arcgis.features import GeoAccessor, GeoSeriesAccessor  # noqa: F401
from osgeo import gdal, ogr

from .database import update_job_layer
from .log import logger

#: throw exceptions on errors rather than returning None
gdal.UseExceptions()

output_folder = Path("/tmp") / "output"
fgdb_path = output_folder / "data.gdb"
formats_with_shape = ["filegdb", "geojson", "shapefile"]


def cleanup():
    """
    Cleanup the output folder.
    """
    if output_folder.exists():
        shutil.rmtree(output_folder)

    output_folder.mkdir(parents=True, exist_ok=True)


def write_to_output(tableName, feature_set, format):
    sdf = feature_set.sdf
    gdf = gpd.GeoDataFrame(feature_set.sdf, geometry=sdf.spatial.name)

    if sdf.spatial.sr is not None:
        try:
            gdf.set_crs(sdf.spatial.sr["latestWkid"], inplace=True)
        except KeyError:
            gdf.set_crs(sdf.spatial.sr["wkid"], inplace=True)

    #: default to csv for tables without geometry for shapefile and geojson formats
    if format == "csv" or (
        format in ["shapefile", "geojson"] and feature_set.geometry_type is None
    ):
        driver = "CSV"
        output_path = output_folder / f"{tableName}.csv"
    elif format == "excel":
        driver = "XLSX"
        output_path = output_folder / f"{tableName}.xlsx"
    elif format == "filegdb":
        gdf.drop("OBJECTID", axis=1, inplace=True)
        driver = "OpenFileGDB"
        output_path = fgdb_path

        #: OpenFileGDB does not support a mix of multi and single geometry types
        #: so we convert them all to multi if there are any multi geometries
        if (gdf.geom_type == "MultiPolygon").any():
            gdf.geometry = gdf.geometry.map(
                lambda geom: MultiPolygon([geom]) if isinstance(geom, Polygon) else geom
            )
        elif (gdf.geom_type == "MultiLineString").any():
            gdf.geometry = gdf.geometry.map(
                lambda geom: MultiLineString([geom])
                if isinstance(geom, LineString)
                else geom
            )
        elif (gdf.geom_type == "MultiPoint").any():
            gdf.geometry = gdf.geometry.map(
                lambda geom: MultiPoint([geom]) if isinstance(geom, Point) else geom
            )
    elif format == "geojson":
        driver = "GeoJSON"
        output_path = output_folder / f"{tableName}.geojson"
    elif format == "shapefile":
        driver = "ESRI Shapefile"
        output_path = output_folder / f"{tableName}.shp"
    else:
        raise ValueError(f"unsupported format: {format}")

    gdf.to_file(output_path, layer=tableName, engine="pyogrio", driver=driver, mode="a")


def get_field_type(field_name, fields) -> str:
    for field in fields:
        if field["name"] == field_name:
            return field["type"]

    raise ValueError(f"field not found: {field_name}")


def download(id, layers, format):
    cleanup()

    return_geometry = format in formats_with_shape

    if format == "filegdb":
        ogr.GetDriverByName("OpenFileGDB").CreateDataSource(fgdb_path)

    related_tables_primary_keys = {}

    for layer in layers:
        tableName = layer["tableName"]
        logger.info(f"query layer: {tableName}")

        try:
            feature_set = get_agol_data(
                layer["url"], layer["objectIds"], return_geometry
            )

            if len(feature_set.features) == 0:
                logger.info("no features found, skipping creation")

                update_job_layer(id, tableName, True)

                continue

            write_to_output(tableName, feature_set, format)

        except Exception as e:
            logger.exception(f"error processing layer: {tableName}")

            update_job_layer(id, tableName, False, str(e))

            continue

        if "relationships" in layer and len(layer["relationships"]) > 0:
            primary_key_name = layer["relationships"][0]["primary"]
            primary_keys = feature_set.sdf.reset_index()[primary_key_name].tolist()

            for relationship_config in layer["relationships"]:
                create_relationship(
                    relationship_config,
                    primary_keys,
                    feature_set.fields,
                    return_geometry,
                    tableName,
                    format,
                    related_tables_primary_keys,
                )

        update_job_layer(id, tableName, True)

    return output_folder


def create_relationship(
    config,
    primary_keys,
    fields,
    return_geometry,
    parent_name,
    format,
    related_table_primary_keys,
):
    logger.info(f"relationship: {config['name']}")
    related_table_name = config["tableName"]

    existing_ids = related_table_primary_keys.setdefault(related_table_name, set())
    requested_ids = set(primary_keys)
    new_ids = requested_ids - set(existing_ids)
    related_table_primary_keys[related_table_name] = existing_ids | requested_ids

    if get_field_type(config["primary"], fields) in [
        "esriFieldTypeString",
        "esriFieldTypeGUID",
    ]:
        ids = [f"'{x}'" for x in new_ids]
    else:
        ids = [str(x) for x in new_ids]

    where = f"{config['foreign']} IN " + f"({','.join(ids)})"
    related_feature_set = get_agol_data(
        config["url"],
        None,
        return_geometry,
        where=where,
    )

    if len(related_feature_set.features) == 0:
        logger.info("no features found, skipping creation")

        return

    write_to_output(related_table_name, related_feature_set, format)

    if format == "filegdb":
        relationship = gdal.Relationship(
            config["name"],
            parent_name,
            config["tableName"],
            gdal.GRC_ONE_TO_MANY,
        )
        relationship.SetLeftTableFields([config["primary"]])
        relationship.SetRightTableFields([config["foreign"]])
        relationship.SetRelatedTableType("feature")

        output_dataset = gdal.OpenEx(str(fgdb_path), gdal.GA_Update)
        if not output_dataset.AddRelationship(relationship):
            logger.info("failed to add relationship")

    if "nestedRelationships" in config:
        for nested_relationship in config["nestedRelationships"]:
            create_relationship(
                nested_relationship,
                related_feature_set.sdf.reset_index()[
                    nested_relationship["primary"]
                ].tolist(),
                related_feature_set.fields,
                return_geometry,
                related_table_name,
                format,
                related_table_primary_keys,
            )


def get_agol_data(
    url: str, object_ids: list[int], return_geometry: bool, where: str = "1=1"
) -> FeatureSet:
    feature_layer = FeatureLayer(url)
    if object_ids is not None:
        object_ids_parameter = [str(x) for x in object_ids]
    else:
        object_ids_parameter = None
    feature_set = feature_layer.query(
        object_ids=object_ids_parameter, where=where, return_geometry=return_geometry
    )
    try:
        feature_set.object_id_field_name = feature_layer.properties["objectIdField"]
    except KeyError:
        feature_set.object_id_field_name = "OBJECTID"

    #: hack to work around issue with FID fields being incorrectly set as the
    #: object id field in the dry cleaners layer
    for field in feature_set.fields:
        if field["name"] == "FID":
            field["type"] = "esriFieldTypeInteger"

    return feature_set
