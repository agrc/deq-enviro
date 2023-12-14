"""
A module for downloading data from enviro.deq.utah.gov feature services.
"""
from osgeo import gdal, ogr
from pathlib import Path
import shutil
from arcgis.features import FeatureLayer, FeatureSet
from .log import logger

#: throw exceptions on errors rather than returning None
gdal.UseExceptions()

output_folder = Path("/tmp") / "output"
fgdb_path = output_folder / "data.gdb"


def cleanup():
    """
    Cleanup the output folder.
    """
    if output_folder.exists():
        shutil.rmtree(output_folder)

    output_folder.mkdir(parents=True, exist_ok=True)


def download(layers, format):
    cleanup()

    if format == "filegdb":
        output_dataset = ogr.GetDriverByName("OpenFileGDB").CreateDataSource(fgdb_path)

    for layer in layers:
        tableName = layer["tableName"]
        logger.info(f"query layer: {tableName}")

        feature_set = get_agol_data(layer["url"], layer["objectIds"])

        if len(feature_set.features) == 0:
            logger.info("no features found, skipping creation")

            continue

        if format == "filegdb":
            write_to_fgdb(tableName, fgdb_path, feature_set)
        elif format == "geojson":
            with open(output_folder / f"{tableName}.geojson", "w") as file:
                file.write(feature_set.to_json)

        if "relationships" in layer:
            primary_key = layer["relationships"][0]["primary"]
            primary_keys = feature_set.df[primary_key].tolist()

            for relationship_config in layer["relationships"]:
                logger.info(f"relationship: {relationship_config['name']}")

                #: todo handle string values in primary keys
                where = f"{relationship_config['foreign']} IN ({','.join([str(x) for x in primary_keys])})"
                related_feature_set = get_agol_data(
                    relationship_config["url"],
                    None,
                    where=where,
                )

                if len(related_feature_set.features) == 0:
                    logger.info("no features found, skipping creation")

                    continue

                if format == "filegdb":
                    write_to_fgdb(
                        relationship_config["tableName"],
                        fgdb_path,
                        related_feature_set,
                    )

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
                elif format == "geojson":
                    with open(
                        output_folder / f"{relationship_config['tableName']}.geojson",
                        "w",
                    ) as file:
                        file.write(related_feature_set.to_json)

    return output_folder


def get_agol_data(url, objectIds, where=None) -> FeatureSet:
    # using the ESRIJSON driver to query the feature service directly using something like the path below
    # isn't going to work because of: https://github.com/OSGeo/gdal/issues/4703
    # path = f'ESRIJSON:{url}/query?objectids={object_ids}&orderByFields=OBJECTID+ASC&outfields=*&f=json'
    # Switching to this in the future would mean that we could drop the arcgis dependency and associated baggage
    feature_layer = FeatureLayer(url)
    if objectIds is not None:
        object_ids = ",".join([str(x) for x in objectIds])
    else:
        object_ids = None
    feature_set = feature_layer.query(object_ids=object_ids, where=where)
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


# async function generateZip(layer, format, send) {
#   const layerUrl = layer.featureService;
#   const parentUrl = layerUrl.substring(0, layerUrl.lastIndexOf('/'));
#   const layerIndex = layerUrl.substring(layerUrl.lastIndexOf('/') + 1);
#   const params = new URLSearchParams({
#     layers: layerIndex,
#     layerQueries: JSON.stringify({
#       [layerIndex]: { where: `OBJECTID IN (${layer.objectIds.join(',')})` },
#     }),
#     syncModel: 'none',
#     dataFormat: format,
#     f: 'json',
#   });

#   /** @type {{ error?: { message: string }; responseUrl?: string }} */
#   let response;
#   try {
#     response = await ky
#       .post(`${parentUrl}/createReplica`, {
#         body: params,
#         timeout: 120 * 60 * 1000,
#       })
#       .json();
#   } catch (error) {
#     response = { error };
#   }

#   if (response.error) {
#     send('RESULT', {
#       result: {
#         tableName: layer.tableName,
#         error: response.error.message,
#       },
#     });
#   } else {
#     send('RESULT', {
#       result: {
#         tableName: layer.tableName,
#         url: response.responseUrl,
#       },
#     });
#   }
# }
