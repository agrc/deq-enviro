#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
test_tool
----------------------------------

Tests for `tool` module.
"""
import unittest
from DeqEnviro import Tool


class TestTool(unittest.TestCase):

    def setUp(self):
        #: the location the partial query layers test db
        workspace = 'C:\Projects\TestData\DEQ\QueryLayers.gdb'
        #: thing being tested
        self.patient = Tool(workspace)

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
        actual = self.patient._get_relationships('VCP')

        self.assertEqual(len(actual.keys()), 3)
        self.assertEqual(actual['deqmap_cerclabranchic'], [2, 'icalinkkey'])

    def test_get_relationship_classes_when_there_are_none(self):
        actual = self.patient._get_relationships('NPL')

        self.assertEqual(len(actual.keys()), 0)

    def test_get_features(self):
        actual = self.patient._get_features({'VCP': [2]})

        for key in actual.keys():
            rows = actual[key]
            actual[key] = map(lambda x: x[0], rows)

        expected = {
            'VCP': [2],
            'deqmap_cerclabranchactmaj': [111, 112, 113, 114, 115, 116],
            'deqmap_cerclabrremed': [51, 52]
        }

        self.assertItemsEqual(actual, expected)

    def test_format_where_clause(self):
        oids = [1, 2, 3, 4]
        expected = 'FIELD in (1,2,3,4)'

        actual = self.patient._format_where_clause('FIELD', oids)
        self.assertEqual(actual, expected)

    def test_format_where_clause_for_related(self):
        index = 2
        foreign_column = 'icalinkkey'
        data = [('objectid', 'something else', 1, 'another column'),
                ('objectid', 'something else', 2, 'another column'),
                ('objectid', 'something else', 2, 'another column')]
        key_map = [index, foreign_column]

        expected = 'icalinkkey in (1,2)'

        actual = self.patient._format_where_clause(related_key_map=key_map, data=data)
        self.assertEqual(actual, expected)
