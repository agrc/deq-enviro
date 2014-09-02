import arcpy
import json
import os
from shutil import rmtree
from zipfile import ZipFile, ZIP_DEFLATED


class Toolbox(object):

    def __init__(self):
        self.label = "DeqEnviro"
        self.alias = "DeqEnviro"

        # List of tool classes associated with this toolbox
        self.tools = [Tool]


class Tool(object):

    version = '0.1.7'

    def __init__(self, workspace=None):
        self.label = "Download"
        self.description = "Download DEQ Environmental Data"
        self.canRunInBackground = True
        self.fgdb = 'DeqEnviro.gdb'
        self.name = 'SearchResults'
        self.workspace = workspace
        self.sr = arcpy.SpatialReference(26912)

        if self.workspace:
            arcpy.env.workspace = self.workspace

    def getParameterInfo(self):
        '''Returns the parameters required for this tool'''

        p0 = arcpy.Parameter(
            displayName='Layer with OID json object',
            name='feature_class_oid_map',
            datatype='String',
            parameterType='Required',
            direction='Input')

        p1 = arcpy.Parameter(
            displayName='Output type',
            name='file_type',
            datatype='String',
            parameterType='Required',
            direction='Input')

        p3 = arcpy.Parameter(
            displayName='Data Location',
            name='location',
            datatype='String',
            parameterType='Optional',
            direction='Input')

        p2 = arcpy.Parameter(
            displayName='Output zip file',
            name='output',
            datatype='File',
            parameterType='Derived',
            direction='Output')

        return [p0, p1, p2, p3]

    def isLicensed(self):
        '''Set whether tool is licensed to execute.'''
        return True

    def updateParameters(self, parameters):
        '''Modify the values and properties of parameters before internal
        validation is performed.  This method is called whenever a parameter
        has been changed.
        '''
        return

    def updateMessages(self, parameters):
        '''Modify the messages created by internal validation for each tool
        parameter.  This method is called after internal validation.
        '''
        return

    def _create_scratch_folder(self, directory):
        arcpy.AddMessage('--_create_scratch_folder::{}'.format(directory))

        if not os.path.exists(directory):
            os.makedirs(directory)

    def _delete_scratch_data(self, directory):
        arcpy.AddMessage('--_delete_scratch_data::{}'.format(directory))

        limit = 5000
        i = 0

        items_to_delete = [self.fgdb, self.name + '.zip']

        while len(filter(os.path.exists, items_to_delete)) > 0 and i < limit:
            try:
                map(rmtree, items_to_delete)
            except:
                i += 1

        return True

    def _get_extension(self, f):
        '''Returns the file type extension

        :param f: the file to get the extension of
        '''
        file_name, file_extension = os.path.splitext(f)

        return file_extension.lower()

    def _zip_output_directory(self, source_location, destination_location):
        '''creates a zip folder based on the `source_location` and `destination_location` parameters.

        :param source_location: the location of the folder to compress
        :param destination_location: the location and name to save the zip file
        '''
        arcpy.AddMessage('--_zip_output_directory::{}'.format(destination_location))

        with ZipFile(destination_location, 'w', ZIP_DEFLATED) as z:
            for root, dirs, files in os.walk(source_location):
                if 'scratch.gdb' in root:
                    continue
                for file_name in files:
                    extension = self._get_extension(file_name)
                    if extension in ['.zip', '.lock']:
                        continue

                    absfn = os.path.join(root, file_name)
                    # XXX: relative path
                    zfn = absfn[len(source_location) + len(os.sep):]
                    z.write(absfn, zfn)

    def _deserialize_json(self, value):
        '''deserializes the parameter json'''
        return json.loads(value)

    def _get_relationships(self, feature_class):
        ''' Returns a dictionary with the table the `feature_class` is related to as the key
        and its primary key as the value

        :param feature_class: A feature class name as shown in the source fgdb. The workspace
        of the tool defines the source fgdb's location.
        '''
        arcpy.AddMessage('--_get_relationships::{}'.format(feature_class))

        description = arcpy.Describe(feature_class)
        relationships = description.relationshipClassNames

        def describe(relation):
            description = arcpy.Describe(relation)
            class_name = description.destinationClassNames[0].lower()

            return class_name, get_relationship_keys(description)

        def get_relationship_keys(relation):
            '''returns the index of the primary key and the name of the foreign key field'''
            origin_keys = relation.OriginClassKeys
            fields = map(lambda f: f.name.lower(), arcpy.ListFields(feature_class))

            keys = dict((toople[1].replace('Origin', '').lower(), toople[0].lower())
                        for i, toople in enumerate(origin_keys))

            primary_key_index = [i for i, field in enumerate(fields) if field == keys['primary']]
            primary_key_index = ''.join(map(str, primary_key_index))

            return [int(primary_key_index), keys['foreign']]

        return dict(map(describe, relationships)), relationships

    def _recreate_relationships(self, relationship_names, output_location):
        '''Recreates the relationships from the source data to the output

        :param relationship_names: an [] of relationship class names
        :param output_location: the location of the .gdb to create the relationship classes
        '''
        arcpy.AddMessage('--_recreate_relationships::{}'.format(', '.join(relationship_names)))

        relationships = map(arcpy.Describe, relationship_names)

        def create_relationship(name_description_map):
            relationship_type = 'SIMPLE'
            attributed = 'NONE'

            name = name_description_map[0]
            description = name_description_map[1]

            arcpy.AddMessage(description)

            if description.isComposite:
                relationship_type = 'COMPOSITE'

            if description.isAttributed:
                attributed = 'ATTRIBUTED'

            cardinality = dict(zip(
                ['OnetoOne', 'OneToMany', 'ManyToMany'],
                ['ONE_TO_ONE', 'ONE_TO_MANY', 'MANY_TO_MANY']))

            origin_keys = description.OriginClassKeys
            keys = dict((toople[1].replace('Origin', '').lower(), toople[0].lower())
                        for i, toople in enumerate(origin_keys))

            source = ''.join(description.originClassNames)
            destination = ''.join(description.destinationClassNames).lower()

            this = arcpy.env.workspace
            arcpy.env.workspace = output_location

            try:
                arcpy.CreateRelationshipClass_management(source,
                                                         destination,
                                                         name,
                                                         relationship_type,
                                                         description.forwardPathLabel,
                                                         description.backwardPathLabel,
                                                         description.notification.upper(),
                                                         cardinality[description.cardinality],
                                                         attributed,
                                                         keys['primary'],
                                                         keys['foreign'])
            finally:
                arcpy.env.workspace = this

        map(create_relationship, zip(relationship_names, relationships))

    def _format_where_clause(self, field=None, values=None, related_key_map=None, data=None):
        '''Returns the sql to find table data in the shape of `field in (values)`
        If `related_key_map` and `data` are present we format the query for a related table.
        Otherwise only field and values are necessary.

        :param field: the feature class attribute field to search for.
        :param values: the values you want to find.
        :param data: the parent feature class rows. This is used to pull the primary key values
        :param related_key_map: contains the index of the primary key and the foreign key value
        '''
        arcpy.AddMessage('--_format_where_clause')

        if related_key_map is not None:
            values = set([row[related_key_map[0]] for row in data])
            field = related_key_map[1]

        values = list(values)
        values = map(str, values)

        return '{} in ({})'.format(field, ','.join(values))

    def _query_features(self, feature_class, fields, where_clause):
        '''Returns an arcpy.da.SearchCursor row

        :param feature_class: the feature class name to query on.
        :param fields: the fields to return from the `feature_class`.
        :param where_clause: the filtering criteria to apply to the `feature_class`
        '''
        arcpy.AddMessage('--_query_features::{}'.format(feature_class))

        with arcpy.da.SearchCursor(feature_class, fields, where_clause) as cursor:
            for row in cursor:
                yield row

    def _get_features(self, feature_class_oid_map, fields='*'):
        '''Returns a dict of layers with the data that should be written to disk

        :param feature_class_oid_map: the layer name and the object id's to save
        :param fields: the fields to retrieve from the class. mainly used for unit tests as `*` is sufficient
        '''
        arcpy.AddMessage('--_get_features')

        result = {}
        relationships = []
        for feature_class in feature_class_oid_map:
            oids = feature_class_oid_map[feature_class]
            where_clause = self._format_where_clause('OBJECTID', oids)
            result.setdefault(feature_class, [])

            # get the origin feature results
            for row in self._query_features(feature_class, fields, where_clause):
                result[feature_class].append(row)

            related_key_map, relationships = self._get_relationships(feature_class)

            # get the related feature results
            for related_table in related_key_map.keys():
                result.setdefault(related_table, [])
                where_clause = self._format_where_clause(
                    related_key_map=related_key_map[related_table],
                    data=result[feature_class])

                for row in self._query_features(related_table, fields, where_clause):
                    result[related_table].append(row)

        return result, relationships

    def _create_gdb_table(self, table_name, output_location):
        '''Creates the appropriate table type given the table name.

        :param table_name: the source table name. This is used as the template for createing the schema along with
        determining the shape type and data type.
        :param output_location: the place on disk to save the table.
        '''
        arcpy.AddMessage('-_create_gdb_table. {}'.format(table_name))

        description = arcpy.Describe(table_name)

        if description.datatype == 'FeatureClass':
            feature_type = description.shapeType.upper()
            arcpy.CreateFeatureclass_management(output_location,
                                                table_name,
                                                feature_type,
                                                template=table_name,
                                                spatial_reference=self.sr)
        elif description.datatype == 'Table':
            arcpy.CreateTable_management(output_location,
                                         table_name,
                                         template=table_name)
        else:
            raise Exception('This data type is not supported {}'.format(description.datatype))

    def _create_fgdb(self, feature_class_oid_map, output_location):
        '''Creates and writes values to a file geodatabse'''
        arcpy.AddMessage('--_create_fgdb::{}'.format(output_location))

        arcpy.CreateFileGDB_management(output_location, self.fgdb)
        output_location = os.path.join(output_location, self.fgdb)

        feature_class_rows_map, relationships = self._get_features(feature_class_oid_map)

        for feature_class in feature_class_rows_map:
            table_location = os.path.join(output_location, feature_class)
            self._create_gdb_table(feature_class, output_location)

            with arcpy.da.InsertCursor(table_location, '*') as cursor:
                for row in feature_class_rows_map[feature_class]:
                    cursor.insertRow(row)

        self._recreate_relationships(relationships, output_location)

    def execute(self, parameters, messages):
        '''Returns the location on the server of a zip file

        :param paramters: the parameters sent to the gp service
        :param message:
        '''
        arcpy.AddMessage('executing version ' + self.version)

        feature_class_oid_map = self._deserialize_json(parameters[0].valueAsText)
        file_type = parameters[1].valueAsText
        workspace = parameters[3].valueAsText
        if workspace is not None:
            arcpy.env.workspace = workspace

        output_location = arcpy.env.scratchFolder
        folder_to_zip = output_location

        self._delete_scratch_data(output_location)
        self._create_scratch_folder(output_location)

        if file_type == 'fgdb':
            arcpy.AddMessage('-Creating a file geodatabase.')

            self._create_fgdb(feature_class_oid_map, output_location)
        elif file_type == 'shp':
            arcpy.AddMessage('-Creating a shapefile.')
        elif file_type == 'csv':
            arcpy.AddMessage('-Creating a file geodatabase.')
        elif file_type == 'xls':
            arcpy.AddMessage('-Creating a file geodatabase.')
        else:
            raise Exception('file type not supported')

        arcpy.AddMessage('-Zipping the result.')
        zip_location = os.path.join(folder_to_zip, self.name + '.zip')

        self._zip_output_directory(folder_to_zip, zip_location)

        arcpy.SetParameterAsText(2, zip_location)

        return zip_location
