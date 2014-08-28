import arcpy
import json
import os
from shutil import rmtree
from zipfile import ZipFile, ZIP_DEFLATED


class Toolbox(object):

    def __init__(self):
        """Define the toolbox (the name of the toolbox is the name of the
        .pyt file)."""
        self.label = "DeqEnviro"
        self.alias = "DeqEnviro"

        # List of tool classes associated with this toolbox
        self.tools = [Tool]


class RelationInformation(object):

    """stores information about the primary and foreign key"""

    def __init__(self, primary, foreign):
        self.primary = primary
        self.foreign = foreign


class Tool(object):

    version = '0.1.0'

    def __init__(self, workspace=None):
        """Define the tool (tool name is the name of the class)."""
        self.label = "Download"
        self.description = "Download DEQ Environmental Data"
        self.canRunInBackground = True
        self.workspace = workspace

        if self.workspace:
            arcpy.env.workspace = self.workspace

    def getParameterInfo(self):
        """Define parameter definitions"""

        p0 = arcpy.Parameter(
            displayName='Layer with OID json object',
            name='layer_feature_map',
            datatype='String',
            parameterType='Required',
            direction='Input')

        p1 = arcpy.Parameter(
            displayName='Output type (fgdb, shp, csv, xls)',
            name='file_type',
            datatype='String',
            parameterType='Required',
            direction='Input')

        p2 = arcpy.Parameter(
            displayName='Output zip file',
            name='output',
            datatype='File',
            parameterType='Derived',
            direction='Output')

        return [p0, p1, p2]

    def isLicensed(self):
        """Set whether tool is licensed to execute."""
        return True

    def updateParameters(self, parameters):
        """Modify the values and properties of parameters before internal
        validation is performed.  This method is called whenever a parameter
        has been changed."""
        return

    def updateMessages(self, parameters):
        """Modify the messages created by internal validation for each tool
        parameter.  This method is called after internal validation."""
        return

    def _create_scratch_folder(self, directory):
        if not os.path.exists(directory):
            os.makedirs(directory)

    def _delete_scratch_data(self, location):
        limit = 5000
        i = 0

        while os.path.exists(location) and i < limit:
            try:
                rmtree(location)
            except:
                i += 1

    def get_extension(self, f):
        file_name, file_extension = os.path.splitext(f)

        return file_extension.lower()

    def zip_output_directory(self, location, name):
        with ZipFile(name, 'w', ZIP_DEFLATED) as z:
            for root, dirs, files in os.walk(location):
                if 'scratch.gdb' in root:
                    continue
                for fn in files:
                    arcpy.AddMessage(fn)
                    if self.get_extension(fn) == '.zip':
                        arcpy.AddMessage('added')
                        continue

                    absfn = os.path.join(root, fn)
                    # XXX: relative path
                    zfn = absfn[len(location) + len(os.sep):]
                    z.write(absfn, zfn)

    def deserialize_json(self, value):
        return json.loads(value)

    def create_fgdb_for(self, layer_feature_map):
        pass

    def _format_where_clause(self, field, values):
        values = list(values)
        values = map(str, values)
        return '{} in ({})'.format(field, ','.join(values))

    def get_features(self, layer_oid_map, fields='*'):
        result = {}
        for layer in layer_oid_map:
            oids = layer_oid_map[layer]
            where_clause = self._format_where_clause('OBJECTID', oids)

            for row in self._get_features(layer, fields, where_clause):
                result.setdefault(layer, []).append(row)

            related_key_map = self.get_relationships(layer)

            for related_table in related_key_map.keys():
                # need to get primary key information
                where_clause = self._format_where_clause(related_key_map[related_table].foreign, result[layer])
                from nose.tools import set_trace
                set_trace()

                for row in self._get_features(related_table, fields, where_clause):
                    result.setdefault(related_table, ()).append(row)

        return result

    def _get_features(self, layer, fields, where_clause):
        with arcpy.da.SearchCursor(layer, fields, where_clause) as cursor:
            for row in cursor:
                yield row

    def get_relationships(self, feature_class):
        """ Returns a dictionary with the table the `feature_class` is related to as the key
        and its primary key as the value

        :param feature_class: A feature class name as shown in the source fgdb. The workspace
        of the tool defines the source fgdb's location.
        """
        description = arcpy.Describe(feature_class)
        relationships = description.relationshipClassNames

        def describe(relation):
            description = arcpy.Describe(relation)
            class_name = description.destinationClassNames[0].lower()

            return class_name, get_relationship_keys(description)

        def get_relationship_keys(relation):
            origin_keys = relation.OriginClassKeys
            keys = dict((toople[1].strip('Origin'), toople[0]) for i, toople in enumerate(origin_keys))

            return 'what' #[keys['Primary'], keys['Foreign']]

        return dict(map(describe, relationships))

    def execute(self, parameters, messages):
        """The source code of the tool."""

        arcpy.AddMessage('---executing version ' + self.version)

        layer_feature_map = self.deserialize_json(parameters[0].valueAsText)
        file_type = parameters[1].valueAsText
        name = 'SearchResults'

        output_location = arcpy.env.scratchFolder
        folder_to_zip = output_location

        self._delete_scratch_data(output_location)
        self._create_scratch_folder(output_location)

        if file_type == 'fgdb':
            arcpy.AddMessage('Creating a file geodatabase.')
            self.create_fgdb_for(layer_feature_map)

        arcpy.AddMessage('Zipping the result.')
        zip_location = os.path.join(folder_to_zip, name + '.zip')

        self.zip_output_directory(folder_to_zip, zip_location)

        arcpy.SetParameterAsText(2, zip_location)

        return
