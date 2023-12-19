"""
A module for downloading data from enviro.deq.utah.gov feature services.
"""
import shutil
from pathlib import Path

from arcgis.features import (
    FeatureLayer,
    FeatureSet,
)
from osgeo import gdal, ogr

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
    #: default to csv for tables without geometry for shapefile and geojson formats
    if format == "csv" or (
        format in ["shapefile", "geojson"] and feature_set.geometry_type is None
    ):
        feature_set.sdf.to_csv(output_folder / f"{tableName}.csv")
    elif format == "excel":
        feature_set.sdf.to_excel(output_folder / f"{tableName}.xlsx")
    elif format == "filegdb":
        write_to_fgdb(tableName, fgdb_path, feature_set)
    elif format == "geojson":
        with open(output_folder / f"{tableName}.geojson", "w") as file:
            file.write(feature_set.to_geojson)
    elif format == "shapefile":
        sdf = feature_set.sdf
        for field in sdf.columns:
            #: reset field values for non-string fields who's values are all null
            #: this prevents problems when converting to shapefile
            #: ref: https://github.com/Esri/arcgis-python-api/issues/1732
            if sdf[field].isnull().all() and sdf[field].dtype != "string":
                logger.info(f"resetting field type as string for field: {field}")
                sdf[field] = sdf[field].astype("string")

        sdf.spatial.to_featureclass(
            output_folder / f"{tableName}.shp", sanitize_columns=False
        )
    else:
        raise ValueError(f"unsupported format: {format}")


def download(layers, format):
    cleanup()

    return_geometry = format in formats_with_shape

    if format == "filegdb":
        ogr.GetDriverByName("OpenFileGDB").CreateDataSource(fgdb_path)

    for layer in layers:
        tableName = layer["tableName"]
        logger.info(f"query layer: {tableName}")

        feature_set = get_agol_data(layer["url"], layer["objectIds"], return_geometry)

        if len(feature_set.features) == 0:
            logger.info("no features found, skipping creation")

            continue

        write_to_output(tableName, feature_set, format)

        if "relationships" in layer and len(layer["relationships"]) > 0:
            primary_key = layer["relationships"][0]["primary"]
            primary_keys = feature_set.sdf.reset_index()[primary_key].tolist()

            for relationship_config in layer["relationships"]:
                logger.info(f"relationship: {relationship_config['name']}")
                related_table_name = relationship_config["tableName"]

                #: todo handle string values in primary keys
                where = f"{relationship_config['foreign']} IN ({','.join([str(x) for x in primary_keys])})"
                related_feature_set = get_agol_data(
                    relationship_config["url"],
                    None,
                    return_geometry,
                    where=where,
                )

                if len(related_feature_set.features) == 0:
                    logger.info("no features found, skipping creation")

                    continue

                write_to_output(related_table_name, related_feature_set, format)

                if format == "filegdb":
                    relationship = gdal.Relationship(
                        relationship_config["name"],
                        layer["tableName"],
                        relationship_config["tableName"],
                        gdal.GRC_ONE_TO_MANY,
                    )
                    relationship.SetLeftTableFields([relationship_config["primary"]])
                    relationship.SetRightTableFields([relationship_config["foreign"]])
                    relationship.SetRelatedTableType("feature")

                    output_dataset = gdal.OpenEx(str(fgdb_path), gdal.GA_Update)
                    if not output_dataset.AddRelationship(relationship):
                        logger.info("failed to add relationship")

    return output_folder


def get_agol_data(url, objectIds, return_geometry, where=None) -> FeatureSet:
    feature_layer = FeatureLayer(url)
    if objectIds is not None:
        object_ids = ",".join([str(x) for x in objectIds])
    else:
        object_ids = None
    feature_set = feature_layer.query(
        object_ids=object_ids, where=where, return_geometry=return_geometry
    )
    # logger.info(feature_set.to_json)

    return feature_set


def write_to_fgdb(tableName, output_path, feature_set):
    output_dataset = gdal.OpenEx(str(output_path), gdal.GA_Update)

    path = f"ESRIJSON:{feature_set.to_json}"
    input_dataset = gdal.OpenEx(path)

    input_layer = input_dataset.GetLayer()

    output_layer = output_dataset.CreateLayer(
        tableName, srs=input_layer.GetSpatialRef(), geom_type=input_layer.GetGeomType()
    )

    for field in input_layer.schema:
        output_layer.CreateField(field)

    for feature in input_layer:
        output_layer.CreateFeature(feature)
