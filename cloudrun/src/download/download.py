"""
A module for downloading data from enviro.deq.utah.gov feature services.
"""
from osgeo import gdal, ogr
from pathlib import Path
import shutil
from arcgis.features import FeatureLayer

#: throw exceptions on errors rather than returning None
gdal.UseExceptions()

output_folder = Path("/tmp") / "output"


def cleanup():
    """
    Cleanup the output folder.
    """
    if output_folder.exists():
        shutil.rmtree(output_folder)

    output_folder.mkdir(parents=True, exist_ok=True)


def download(layers, format):
    cleanup()

    output_path = output_folder / "data.gdb"
    output_dataset = ogr.GetDriverByName("OpenFileGDB").CreateDataSource(output_path)

    for layer in layers:
        primary_key = None
        if "relationships" in layer and len(layer["relationships"]) > 0:
            primary_key = layer["relationships"][0]["primary"]

        primary_keys = translate(
            layer["tableName"],
            layer["url"],
            layer["objectIds"],
            output_path,
            primary_key,
        )

        if "relationships" in layer:
            print("relationships...")
            for relationship_config in layer["relationships"]:
                print(relationship_config["name"])
                translate_result = translate(
                    relationship_config["tableName"],
                    relationship_config["url"],
                    None,
                    output_path,
                    #: todo handle string values in primary keys
                    where=f"{relationship_config['foreign']} IN ({','.join([str(x) for x in primary_keys])})",
                )

                if translate_result is not None:
                    relationship = gdal.Relationship(
                        relationship_config["name"],
                        layer["tableName"],
                        relationship_config["tableName"],
                        gdal.GRC_ONE_TO_MANY,
                    )
                    relationship.SetLeftTableFields([relationship_config["primary"]])
                    relationship.SetRightTableFields([relationship_config["foreign"]])
                    relationship.SetRelatedTableType("feature")

                    output_dataset = gdal.OpenEx(str(output_path), gdal.GA_Update)
                    if not output_dataset.AddRelationship(relationship):
                        print("failed to add relationship")

    return output_path


def translate(tableName, url, objectIds, output_path, primary_key=None, where=None):
    print(tableName)

    output_dataset = gdal.OpenEx(str(output_path), gdal.GA_Update)
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
    # print(feature_set.to_json)

    if len(feature_set.features) == 0:
        print("no features found, skipping creation")

        return None

    path = f"ESRIJSON:{feature_set.to_json}"
    input_dataset = gdal.OpenEx(path)

    input_layer = input_dataset.GetLayer()

    output_layer = output_dataset.CreateLayer(
        tableName, srs=input_layer.GetSpatialRef(), geom_type=input_layer.GetGeomType()
    )

    for field in input_layer.schema:
        output_layer.CreateField(field)

    primary_keys = []
    for feature in input_layer:
        if primary_key is not None:
            primary_keys.append(feature.GetField(primary_key))
        output_layer.CreateFeature(feature)

    return primary_keys
