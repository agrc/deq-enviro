import arcpy
import csv
import itertools
import json
import os
import re
import xlsxwriter
from glob import glob
from shutil import rmtree
from zipfile import ZipFile, ZIP_DEFLATED


class Toolbox(object):

    def __init__(self):
        self.label = 'DeqEnviro'
        self.alias = 'DeqEnviro'

        # List of tool classes associated with this toolbox
        self.tools = [Tool]


class TableInfo(object):

    '''contains information about layers'''

    def __init__(self, table, ids, primary_key=None):

        self._created = False
        self._layer_name = None
        self._table = table
        self.description = arcpy.Describe(table)
        self.ids = ids
        self.primary_key = primary_key

    def __str__(self):
        return '{}\r\ncreated: {}\r\nfields: {}\r\ntable: {}\r\nrelationships: {}'.format(self.name, self.created, self.fields, self.is_table, self.relationship_names)

    @property
    def created(self):
        return self._created

    @created.setter
    def created(self, value):
        self._created = value

    @property
    def fields(self):
        return map(lambda x: x.name, self.description.fields)

    @property
    def is_table(self):
        return self.description.datatype == 'Table'

    @property
    def name(self):
        return self._table

    @property
    def relationship_names(self):
        return self.description.relationshipClassNames

    @property
    def selection_name(self):
        return '{}_selection'.format(self._table)

    def where_clause(self, field):
        '''Returns the sql to find table data in the shape of `field in (values)`

        :param field: the field to query.
        :param values: the values you want to find.
        '''

        if len(self.ids) > 0:
            if isinstance(self.ids[0], basestring):
                quote_style = lambda v: "'{}'".format(v)
            else:
                quote_style = str

            ids = map(quote_style, self.ids)

            return '{} in ({})'.format(field, ','.join(ids))
        else:
            return '1 = 2'

    def export(self, location):
        '''exports the selection_name to the `location`.

        :param location: the location of a fgdb to export into.
        '''
        if not self.created:
            if not self.is_table:
                arcpy.MakeFeatureLayer_management(
                    self.name,
                    self.selection_name,
                    where_clause=self.where_clause(self.primary_key))
            else:
                arcpy.MakeTableView_management(
                    self.name,
                    self.selection_name,
                    where_clause=self.where_clause(self.primary_key))

        if self.is_table:
            arcpy.TableToTable_conversion(self.selection_name, location, self.name)
        else:
            arcpy.FeatureClassToFeatureClass_conversion(self.selection_name, location, self.name)


class RelationshipInfo(object):

    """info on relationships"""

    def __init__(self, name):
        self.name = name
        self.description = arcpy.Describe(name)

        origin_keys = self.description.OriginClassKeys
        self.keys = dict((toople[1].replace('Origin', ''), toople[0])
                         for i, toople in enumerate(origin_keys))

    def __str__(self):
        return '{}\r\ndestination table: {}\r\norigin table: {}\r\nprimary key: {}\r\nforeign key: {}'.format(self.name, self.destination_table_name, self.origin_table_name, self.primary_key, self.foreign_key)

    @property
    def cardinality(self):
        return self._underscore(self.description.cardinality)

    @property
    def destination_table_name(self):
        return self.description.destinationClassNames[0]

    @property
    def origin_table_name(self):
        return self.description.originClassNames[0]

    @property
    def primary_key(self):
        return self.keys['Primary']

    @property
    def foreign_key(self):
        return self.keys['Foreign']

    def export(self, location):
        relationship_type = 'SIMPLE'
        attributed = 'NONE'

        if self.description.isComposite:
            relationship_type = 'COMPOSITE'

        if self.description.isAttributed:
            attributed = 'ATTRIBUTED'

        arcpy.CreateRelationshipClass_management(self.origin_table_name,
                                                 self.destination_table_name,
                                                 self.name,
                                                 relationship_type,
                                                 self.description.forwardPathLabel,
                                                 self.description.backwardPathLabel,
                                                 self.description.notification.upper(),
                                                 self.cardinality,
                                                 attributed,
                                                 self.primary_key,
                                                 self.foreign_key)

    def _underscore(self, word):
        word = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\1_\2', word)
        word = re.sub(r'([a-z\d])([A-Z])', r'\1_\2', word)
        word = word.replace('-', '_')

        return word.upper()


class Tool(object):

    version = '0.4.1'

    def __init__(self, workspace=None):
        self.label = 'Download'
        self.description = 'Download DEQ Environmental Data ' + self.version
        self.canRunInBackground = True
        self.fgdb = 'DeqEnviro.gdb'
        self.name = 'SearchResults'
        self.workspace = workspace
        self.sr = arcpy.SpatialReference(26912)
        self.table_info = {}
        self.relationship_info = {}

        if self.workspace:
            arcpy.env.workspace = self.workspace

    def getParameterInfo(self):
        '''Returns the parameters required for this tool'''

        p0 = arcpy.Parameter(
            displayName='Layer with OID json object',
            name='table_id_map',
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

    def _delete_scratch_data(self, directory, types=None):
        arcpy.AddMessage('--_delete_scratch_data::{}'.format(directory))

        limit = 5000
        i = 0

        if types is None:
            types = ['csv', 'zip', 'xlsx', 'gdb', 'cpg', 'dbf', 'xml', 'prj', 'sbn', 'sbx', 'shx', 'shp']

        items_to_delete = map(lambda x: glob(os.path.join(directory, '*.' + x)), types)
        # flatten [[], []]
        items_to_delete = list(itertools.chain.from_iterable(items_to_delete))

        def remove(thing):
            if os.path.isdir(thing):
                rmtree(thing)
            else:
                os.remove(thing)

        while len(filter(os.path.exists, items_to_delete)) > 0 and i < limit:
            try:
                map(remove, items_to_delete)
            except Exception as e:
                print e
                i += 1

        return True

    def _get_extension(self, f):
        '''Returns the file type extension

        :param f: the file to get the extension of
        '''
        file_name, file_extension = os.path.splitext(f)

        return file_extension.lower()

    def _flatten(self, iterable):
        return list(itertools.chain.from_iterable(iterable))

    def _zip_output_directory(self, source_location, destination_location):
        '''creates a zip folder based on the `source_location` and `destination_location` parameters.

        :param source_location: the location of the folder to compress
        :param destination_location: the location and name to save the zip file
        '''
        arcpy.AddMessage('--_zip_output_directory::{}'.format(destination_location))

        with ZipFile(destination_location, 'w', ZIP_DEFLATED) as zip_writer:
            for root, dirs, files in os.walk(source_location):
                if 'scratch.gdb' in root:
                    continue
                for file_name in files:
                    extension = self._get_extension(file_name)
                    if extension in ['.zip', '.lock']:
                        continue

                    full_name = os.path.join(root, file_name)
                    name = full_name[len(source_location) + len(os.sep):]
                    zip_writer.write(full_name, name)

    def _deserialize_json(self, value):
        '''deserializes the parameter json'''
        return json.loads(value)

    def _recreate_relationships(self, output_location):
        '''Recreates the relationships from the source data to the output

        :param relationship_names: an [] of relationship class names
        :param output_location: the location of the .gdb to create the relationship classes
        '''
        arcpy.AddMessage('--_recreate_relationships')

        relationships = self._filter_relationships()

        map(lambda x: x.export(output_location), relationships)

    def _create_fgdb(self, output_location):
        '''Creates and writes values to a file geodatabse

        :param output_location: the parent folder to the *.gdb
        '''
        arcpy.AddMessage('--create_fgdb::{}'.format(output_location))

        arcpy.CreateFileGDB_management(output_location, self.fgdb)
        output_location = os.path.join(output_location, self.fgdb)

        return output_location

    def _create_view(self, table_info, relationship=None):
        arcpy.AddMessage('--create_view::{}'.format(table_info.name))

        if table_info.is_table:
            arcpy.MakeTableView_management(
                table_info.name,
                table_info.selection_name)
        else:
            arcpy.MakeFeatureLayer_management(
                table_info.name,
                table_info.selection_name)

        arcpy.SelectLayerByAttribute_management(
            table_info.selection_name,
            'ADD_TO_SELECTION',
            table_info.where_clause(table_info.primary_key or relationship.primary_key))

    def _filter_relationships(self):
        tables = self.table_info.keys()

        return filter(lambda x: x.destination_table_name in tables and x.origin_table_name in tables, self.relationship_info.values())

    def _discover_the_info(self):
        '''discovers all of the feature classes, tables, and relationship classes
        '''
        arcpy.AddMessage('--discover_the_info')

        relationship_class_names = []

        for table in self.table_info.values():
            relationship_class_names = relationship_class_names + table.relationship_names

        relationships = map(RelationshipInfo, set(relationship_class_names))

        for relation in relationships:
            self._dig_deeper(relation)

        return self.table_info, self.relationship_info

    def _build_parent_table_info(self, table_id_map):
        '''creates `model.Info` classes for each table and addes them to a global dictionary to keep track.

        :param table_id_map: the parent feature classes mapped with the id's to query for
        '''
        arcpy.AddMessage('--build_parent_table_info')

        for table_name, ids in table_id_map.iteritems():
            # table_name: 'VCP'
            # ids: ['C040']

            info = TableInfo(table_name, ids, 'ID')
            self.table_info.setdefault(table_name, info)

    def _new_table(self, name):
        return name not in self.table_info.keys()

    def _new_relationship(self, name):
        return name not in self.relationship_info.keys()

    def _get_ids(self, origin_table, relationship):
        '''gets the id's of the related records for use in the generation of the where clause

        :param origin_table: the parent table name used as a key to get the `TableInfo` model
        :param relationship: the relationship it belongs to
        '''
        arcpy.AddMessage('--get_ids::{}'.format(origin_table))

        table_info = self.table_info[origin_table]

        self._create_view(table_info, relationship)

        ids = []
        with arcpy.da.SearchCursor(table_info.selection_name, relationship.primary_key) as cursor:
            for row in cursor:
                ids.append(row[0])

        return ids

    def _create_table_info(self, relationship):
        '''creates a `TableInfo` model and also gets it's id's from its parent table

        :param relationship: the relationship it belongs to
        '''
        arcpy.AddMessage('--create_table_info::{}'.format(relationship.name))

        origin = relationship.origin_table_name

        ids = self._get_ids(origin, relationship)

        table_info = TableInfo(relationship.destination_table_name, ids)
        table_info.primary_key = relationship.foreign_key

        return table_info

    def _dig_deeper(self, relationship):
        '''a recursive function that discovers tables through relationships
        it breaks when the table is already in the global `table_info` dictionary

        :param relationship: the seed relationship to start exploring
        '''
        arcpy.AddMessage('--dig_deeper::{}'.format(relationship.name))

        while self._new_table(relationship.destination_table_name):
            table_info = self._create_table_info(relationship)
            self.table_info[relationship.destination_table_name] = table_info

            for name in table_info.relationship_names:
                if self._new_relationship(name):
                    info = RelationshipInfo(name)
                    self.relationship_info[name] = info
                    self._dig_deeper(info)

    def _export_to_fgdb(self, output_location):
        '''a recursive function that discovers tables through relationships
        it breaks when the table is already in the global `table_info` dictionary

        :param relationship: the seed relationship to start exploring
        '''
        arcpy.AddMessage('--export_to_fgdb::{}'.format(output_location))

        for table in self.table_info.values():
            table.export(output_location)

    def _create_shapefile(self, input_location, output_location):
        '''Creates and writes values to a shapefile'''
        arcpy.AddMessage('--_create_shapefile::{}'.format(output_location))

        this = arcpy.env.workspace
        arcpy.env.workspace = input_location

        feature_classes = arcpy.ListFeatureClasses()
        tables = arcpy.ListTables()

        def truncate_strings(table):
            fields = map(lambda field: field.name, filter(
                lambda field: field.type == 'String', arcpy.Describe(table).fields))

            def truncate_string(value):
                if value is None:
                    return value

                return value[:255]

            with arcpy.da.Editor(input_location):
                with arcpy.da.UpdateCursor(table, fields) as cursor:
                    for row in cursor:
                        if(filter(lambda data: data is not None and len(data) > 255, row)) == 0:
                            continue

                        row = map(truncate_string, row)
                        cursor.updateRow(row)

        map(truncate_strings, feature_classes + tables)

        try:
            if len(feature_classes) > 0:
                arcpy.FeatureClassToShapefile_conversion(feature_classes, output_location)
            if len(tables) > 0:
                arcpy.TableToDBASE_conversion(tables, output_location)
        finally:
            arcpy.env.workspace = this

        # not needed when running on arcgis server
        arcpy.Delete_management(input_location)

    def _create_xls(self, input_location, output_location):
        '''Creates and writes values to an xlsx file'''
        arcpy.AddMessage('--_create_xls::{}'.format(output_location))

        save_location = os.path.join(output_location, 'DeqEnviroSearchResults.xlsx')

        this = arcpy.env.workspace
        arcpy.env.workspace = input_location

        tables = arcpy.ListFeatureClasses() + arcpy.ListTables()

        def convert_tuple(value):
            if not isinstance(value, tuple):
                return value

            return str(value)

        try:
            workbook = xlsxwriter.Workbook(save_location)

            for table in tables:
                worksheet = workbook.add_worksheet(table)
                # write header
                worksheet.write_row('A1', map(lambda x: x.name, arcpy.ListFields(table)))

                with arcpy.da.SearchCursor(table, '*') as cursor:
                    cell = 2
                    for row in cursor:
                        row = map(convert_tuple, row)
                        # start at A2
                        worksheet.write_row('A' + str(cell), row)
                        cell += 1
        finally:
            workbook.close()
            arcpy.env.workspace = this

    def _create_csv(self, input_location, output_location):
        '''Creates and writes values to a csv'''
        arcpy.AddMessage('--_create_xls::{}'.format(output_location))

        this = arcpy.env.workspace
        arcpy.env.workspace = input_location

        tables = arcpy.ListFeatureClasses() + arcpy.ListTables()

        try:
            for table in tables:
                table_location = os.path.join(output_location, table)

                with open(table_location + '.csv', 'wb') as csv_file:
                    cursor = csv.writer(csv_file, dialect=csv.excel)
                    # write the header
                    cursor.writerow(map(lambda x: x.name, arcpy.ListFields(table)))

                    with arcpy.da.SearchCursor(table, '*') as search_cursor:
                        for row in search_cursor:
                            encode_row = []
                            for v in row:
                                if isinstance(v, basestring):
                                    v = v.encode('utf-8')
                                encode_row.append(v)
                            cursor.writerow(encode_row)
        finally:
            arcpy.env.workspace = this

    def execute(self, parameters, messages):
        '''Returns the location on the server of a zip file

        :param paramters: the parameters sent to the gp service
        :param message:
        '''
        arcpy.AddMessage('executing version ' + self.version)

        table_id_map = self._deserialize_json(parameters[0].valueAsText)
        file_type = parameters[1].valueAsText
        workspace = parameters[3].valueAsText

        if workspace is not None:
            arcpy.env.workspace = workspace

        output_location = arcpy.env.scratchFolder
        folder_to_zip = output_location
        delete_temp_gdb = True

        # not needed when running on server
        self._delete_scratch_data(output_location)

        self._create_scratch_folder(output_location)

        gdb = self._create_fgdb(output_location)

        self._build_parent_table_info(table_id_map)
        self._discover_the_info()
        self._export_to_fgdb(gdb)

        # need to use a var for shp because when publishing to ags or else:
        # elif file_type == 'shp' gets changed to: elif file_type == arcpy.env.packageWorkspace:
        shp = 'shp'
        if file_type == 'fgdb':
            delete_temp_gdb = False
            workspace = arcpy.env.workspace
            try:
                arcpy.env.workspace = gdb
                self._recreate_relationships(gdb)
            finally:
                arcpy.env.workspace = workspace

        elif file_type == shp:
            arcpy.AddMessage('-Creating a shapefile.')

            self._create_shapefile(gdb, output_location)
        elif file_type == 'csv':
            arcpy.AddMessage('-Creating a file geodatabase.')

            self._create_csv(gdb, output_location)
        elif file_type == 'xls':
            arcpy.AddMessage('-Creating a file geodatabase.')

            self._create_xls(gdb, output_location)
        else:
            raise Exception('file type not supported: {}'.format(file_type))

        # no needed for server
        if delete_temp_gdb:
            self._delete_scratch_data(output_location, ['gdb'])

        arcpy.AddMessage('-Zipping the result.')
        zip_location = os.path.join(folder_to_zip, self.name + '.zip')

        self._zip_output_directory(folder_to_zip, zip_location)

        arcpy.SetParameterAsText(2, zip_location)

        return zip_location
