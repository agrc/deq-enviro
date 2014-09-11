#!/usr/bin/env python
# -*- coding: utf-8 -*-

'''
test_tool
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


class TestTool(unittest.TestCase):

    link = 'C:\\Projects\\GitHub\\deq-enviro\\scripts\\download\DeqEnviro.py'
    source = 'C:\\Projects\\GitHub\\deq-enviro\\scripts\\download\DeqEnviro.pyt'
    workspace = 'C:\MapData\DEQEnviro\QueryLayers.gdb'
    scratch = 'C:\\Users\\agrc-arcgis\\Documents\\ArcGIS\\scratch'

    @classmethod
    def setUpClass(cls):
        #: the location the partial query layers test db

        def symlink(source, link_name):
            os_symlink = getattr(os, "symlink", None)
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

        symlink(cls.source, cls.link)

    @classmethod
    def tearDownClass(cls):
        os.remove(cls.link)

    def setUp(self):
        from DeqEnviro import Tool

        #: thing being tested
        self.patient = Tool(self.workspace)

    def tearDown(self):
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

    def test_get_relationship_classes(self):
        actual, relationships = self.patient._get_relationships('VCP')

        self.assertEqual(len(actual.keys()), 3)
        self.assertEqual(actual['deqmap_cerclabranchic'], [1, 'icalinkkey'])

    def test_get_relationship_classes_when_there_are_none(self):
        actual, relationships = self.patient._get_relationships('DWQMercuryInFishTissue')

        self.assertEqual(len(actual.keys()), 0)

    def test_get_relationships_when_they_are_recursive(self):
        actual, relationships = self.patient._get_relationships('UICFacility')

        self.assertEqual(len(actual.keys()), 4)
        self.assertEqual(actual['deqmap_uicfacility_to_uicauthorization'], [1, 'facility_fk'])
        self.assertEqual(actual['deqmap_uicfacility_to_uicwell'], [1, 'facility_fk'])
        self.assertEqual(actual['deqmap_uicwell_to_uicwelloperationstatus'], [1, 'well_fk'])
        self.assertEqual(actual['deqmap_uicauthorization_to_uicauthorizationaction'], [1, 'authorization_fk'])

    def test_get_features(self):
        actual, relationships = self.patient._get_features({'VCP': ['C040']})

        for key in actual.keys():
            if key != 'VCP':
                rows = actual[key]
                actual[key] = map(lambda x: x[0], rows)

        expected = {
            'VCP': 'VCP_selection',
            'deqmap_cerclabranchactmaj': [111, 112, 113, 114, 115, 116],
            'deqmap_cerclabrremed': [51, 52],
            'deqmap_cerclabranchic': []
        }

        # self.assertItemsEqual(actual, expected)
        self.assertEqual(actual['VCP'], expected['VCP'])
        self.assertEqual(len(actual['deqmap_cerclabranchactmaj']), 6)
        self.assertEqual(len(actual['deqmap_cerclabrremed']), 2)
        self.assertEqual(len(actual['deqmap_cerclabranchic']), 0)

    def test_format_where_clause(self):
        oids = ['1', '2', '3', '4']
        expected = "FIELD in ('1','2','3','4')"

        actual = self.patient._format_where_clause('FIELD', oids)
        self.assertEqual(expected, actual)

    def test_format_where_clause_numbers(self):
        oids = [1, 2, 3, 4]
        expected = "FIELD in (1,2,3,4)"

        actual = self.patient._format_where_clause('FIELD', oids)
        self.assertEqual(expected, actual)

    def test_create_fgdb(self):
        parameters = [Parameter('{"VCP": ["C040"]}'),
                      Parameter('fgdb'),
                      None,
                      Parameter('C:\\Projects\\TestData\\DEQ\\QueryLayers.gdb')]

        self.patient.execute(parameters, None)

    def test_create_shapefile(self):
        parameters = [Parameter('{"EnvironmentalIncidents": ["8842", "11407"]}'),
                      Parameter('shp'),
                      None,
                      Parameter('C:\\Projects\\TestData\\DEQ\\QueryLayers.gdb')]

        self.patient.execute(parameters, None)
