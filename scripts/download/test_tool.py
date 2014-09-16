#!/usr/bin/env python
# -*- coding: utf-8 -*-

'''
_test_tool
----------------------------------

Tests for `tool` module.
'''
import arcpy
import os
import unittest


class Parameter(object):

    def __init__(self, value):
        super(Parameter, self).__init__()
        self.value = value

    @property
    def valueAsText(self):
        return self.value


class TestTableModel(unittest.TestCase):
    workspace = 'C:\\MapData\\DEQEnviro\\QueryLayers.gdb'
    link = 'C:\\Projects\\GitHub\\deq-enviro\\scripts\\download\DeqEnviro.py'
    source = 'C:\\Projects\\GitHub\\deq-enviro\\scripts\\download\DeqEnviro.pyt'

    @classmethod
    def setUpClass(cls):

        def symlink(source, link_name):
            os_symlink = getattr(os, 'symlink', None)
            if callable(os_symlink):
                os_symlink(source, link_name)
            else:
                import ctypes
                csl = ctypes.windll.kernel32.CreateSymbolicLinkW
                csl.argtypes = (ctypes.c_wchar_p, ctypes.c_wchar_p, ctypes.c_uint32)
                csl.restype = ctypes.c_ubyte
                flags = 1 if os.path.isdir(source) else 0
                if csl(link_name, source, flags) == 0:
                    raise ctypes.WinError()
        try:
            os.remove(cls.link)
        except:
            pass
        try:
            symlink(cls.source, cls.link)
        except:
            pass

    @classmethod
    def tearDownClass(cls):
        os.remove(cls.link)

    def setUp(self):
        from DeqEnviro import TableInfo

        arcpy.env.workspace = self.workspace
        self.patient = TableInfo('VCP', ['C040'])

    def test_fields(self):
        actual = self.patient.fields
        expected = [
            u'OBJECTID',
            u'ST_KEY',
            u'DERRID',
            u'CIMID',
            u'MAPLABEL',
            u'SITEDESC',
            u'SITENAME',
            u'SITEADDRES',
            u'SITECITY',
            u'SITECNTY',
            u'STATE',
            u'ZIPCODE',
            u'ZIP4',
            u'CURRPROJMA',
            u'CONPHONE',
            u'NORTHING',
            u'EASTING',
            u'DATEOFAPPL',
            u'DATECOCIS',
            u'PROJDESC',
            u'GlobalID',
            u'Shape',
            u'ID',
            u'NAME',
            u'ADDRESS',
            u'CITY',
            u'TYPE']

        self.assertItemsEqual(actual, expected)

    def test_is_table(self):
        from DeqEnviro import TableInfo

        self.assertFalse(self.patient.is_table)

        self.patient = TableInfo('uicauthorization', ['C040'])
        self.assertTrue(self.patient.is_table)

    def test_relationship_names(self):
        actual = self.patient.relationship_names
        expected = [
            u'DEQMAP_VCP_TO_CERCLABRANCHIC',
            u'DEQMAP_VCP_TO_CERCLABRANCHACTMAJ',
            u'DEQMAP_VCP_TO_CERCLABRREMED']

        self.assertItemsEqual(actual, expected)

    def test_where_clause(self):
        self.patient.ids = [1, 2, 3, 4]

        actual = self.patient.where_clause('ID')
        expected = 'ID in (1,2,3,4)'

        self.assertEqual(actual, expected)

        self.patient.ids = ['1', '2', '3']

        actual = self.patient.where_clause('ID')
        expected = "ID in ('1','2','3')"

        self.assertEqual(actual, expected)

        self.patient.ids = ['C040']
        actual = self.patient.where_clause('ID')
        expected = "ID in ('C040')"

        self.assertEqual(actual, expected)

        actual = self.patient.where_clause('ID')
        self.assertEqual(actual, expected)

    def test_selection_name(self):
        self.assertEqual(self.patient.name, 'VCP')
        self.assertEqual(self.patient.selection_name, 'VCP_selection')


class TestRelationshipModel(unittest.TestCase):
    workspace = 'C:\\MapData\\DEQEnviro\\QueryLayers.gdb'
    link = 'C:\\Projects\\GitHub\\deq-enviro\\scripts\\download\DeqEnviro.py'
    source = 'C:\\Projects\\GitHub\\deq-enviro\\scripts\\download\DeqEnviro2.pyt'

    @classmethod
    def setUpClass(cls):

        def symlink(source, link_name):
            os_symlink = getattr(os, 'symlink', None)
            if callable(os_symlink):
                os_symlink(source, link_name)
            else:
                import ctypes
                csl = ctypes.windll.kernel32.CreateSymbolicLinkW
                csl.argtypes = (ctypes.c_wchar_p, ctypes.c_wchar_p, ctypes.c_uint32)
                csl.restype = ctypes.c_ubyte
                flags = 1 if os.path.isdir(source) else 0
                if csl(link_name, source, flags) == 0:
                    raise ctypes.WinError()
        try:
            os.remove(cls.link)
        except:
            pass
        try:
            symlink(cls.source, cls.link)
        except:
            pass

    @classmethod
    def tearDownClass(cls):
        os.remove(cls.link)

    def setUp(self):
        arcpy.env.workspace = self.workspace
        from DeqEnviro import RelationshipInfo
        self.patient = RelationshipInfo('DEQMAP_VCP_TO_CERCLABRANCHIC')

    def test_destination_table_name(self):
        actual = self.patient.destination_table_name
        expected = 'DEQMAP_CERCLABRANCHIC'

        self.assertEqual(actual, expected)

    def test_origin_table_name(self):
        actual = self.patient.origin_table_name
        expected = 'VCP'

        self.assertEqual(actual, expected)

    def test_primary_key(self):
        actual = self.patient.primary_key
        expected = 'ST_KEY'

        self.assertEqual(actual, expected)

    def test_foreign_key(self):
        actual = self.patient.foreign_key
        expected = 'ICALINKKEY'

        self.assertEqual(actual, expected)

    def test_underscore(self):
        test = ['OneToOne', 'OneToMany', 'ManyToMany']

        underscored = map(self.patient._underscore, test)

        self.assertItemsEqual(underscored, ['ONE_TO_ONE', 'ONE_TO_MANY', 'MANY_TO_MANY'])


class TestTool(unittest.TestCase):

    link = 'C:\\Projects\\GitHub\\deq-enviro\\scripts\\download\DeqEnviro.py'
    source = 'C:\\Projects\\GitHub\\deq-enviro\\scripts\\download\DeqEnviro2.pyt'
    #: the location the partial query layers test db
    workspace = 'C:\\MapData\\DEQEnviro\\QueryLayers.gdb'
    scratch = 'C:\\Users\\agrc-arcgis\\Documents\\ArcGIS\\scratch'

    @classmethod
    def setUpClass(cls):

        def symlink(source, link_name):
            os_symlink = getattr(os, 'symlink', None)
            if callable(os_symlink):
                os_symlink(source, link_name)
            else:
                import ctypes
                csl = ctypes.windll.kernel32.CreateSymbolicLinkW
                csl.argtypes = (ctypes.c_wchar_p, ctypes.c_wchar_p, ctypes.c_uint32)
                csl.restype = ctypes.c_ubyte
                flags = 1 if os.path.isdir(source) else 0
                if csl(link_name, source, flags) == 0:
                    raise ctypes.WinError()
        try:
            os.remove(cls.link)
        except:
            pass
        try:
            symlink(cls.source, cls.link)
        except:
            pass

    @classmethod
    def tearDownClass(cls):
        os.remove(cls.link)

    def setUp(self):
        from DeqEnviro import Tool

        #: thing being tested
        self.patient = Tool(self.workspace)

    def tearDown(self):
        self.patient._delete_scratch_data(self.scratch)
        arcpy.Delete_management('VCP_selection')

    def test_sanity(self):
        self.assertIsNotNone(self.patient)

    def test_deserialize_json_creates_dict(self):
        json = '{"11": ["123", "34d", "2345"], "15": ["s33", "3dsd", "2345"] }'

        actual = self.patient._deserialize_json(json)
        expected = {
            "11": ["123", "34d", "2345"],
            "15": ["s33", "3dsd", "2345"]
        }

        self.assertDictEqual(actual, expected)

    def test_create_fgdb(self):
        actual = self.patient._create_fgdb(self.scratch)

        self.assertEqual(os.path.isdir(actual), True)

    def test_discover_info(self):
        self.patient._build_parent_table_info({'VCP': ['C040']})

        tables, relationships = self.patient._discover_the_info()

        self.assertEqual(len(tables.keys()), 6)
        self.assertItemsEqual(tables.keys(), ['DEQMAP_CERCLABRANCHIC',
                                              'DEQMAP_CERCLABRANCHACTMAJ',
                                              'DEQMAP_CERCLABRANCHACTMIN',
                                              'DEQMAP_CERCLABRREMED',
                                              'DEQMAP_CERCLABRRESTRICT',
                                              'VCP'])

    def test_filter_relationships(self):
        self.patient._build_parent_table_info({'VCP': ['C040']})
        self.patient._discover_the_info()

        actual = self.patient._filter_relationships()

        self.assertEqual(len(actual), 26)

    def test_discover_info_when_there_are_none(self):
        self.patient._build_parent_table_info({'DWQMercuryInFishTissue': ['4909500']})

        tables, relationships = self.patient._discover_the_info()

        self.assertEqual(len(tables.keys()), 1)
        self.assertEqual(len(relationships.keys()), 0)

    def test_execute_shapefile(self):
        parameters = [Parameter('{"EnvironmentalIncidents": ["8842", "11407"]}'),
                      Parameter('shp'),
                      None,
                      Parameter(self.workspace)]

        self.patient.execute(parameters, None)

    def test_execute_fgdb(self):
        parameters = [Parameter('{"VCP": ["C040"]}'),
                      Parameter('fgdb'),
                      None,
                      Parameter(self.workspace)]

        self.patient.execute(parameters, None)
