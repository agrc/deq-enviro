#!/usr/bin/env python
# * coding: utf8 *
'''
test_update_sgid.py

A module that contains tests for update_sgid.py
'''
import arcpy
import os
import settings
import sys
import unittest
from mock import patch
from settings import fieldnames

sys.path.append(os.getcwd() + '../')
import update_sgid

setOne = set(['one', 'two', 'three'])
setTwo = set(['two', 'three', 'four', 'five'])
test_data = os.path.join(os.path.dirname(__file__), 'data.gdb')
get_datasets_return_value = [{fieldnames.sourceData: '\\168.178.43.239\GIS\DWGIS\DWDATA\DWPUBLIC.gdb\SourceWaterProtection\GroundWaterZones',
                              fieldnames.sgidName: 'DirectFrom.Source.GroundWaterZones'},
                             {fieldnames.sourceData: 'SGID10 as WATER on local.sde\SGID10.WATER.Providers',
                              fieldnames.sgidName: 'SGID10.ENVIRONMENT.DAQAirMonitorByStation'},
                             {fieldnames.sourceData: os.path.join(test_data, 'LatLong'),
                              fieldnames.sgidName: 'SGID10.WATER.Stations'},  #: table to point
                             {fieldnames.sourceData: '<updated through ogm script at 4:15 AM daily>',
                              fieldnames.sgidName: 'SGID10.ENERGY.DNROilGasWells'},
                             {fieldnames.sourceData: os.path.join(test_data, 'LatLong_point'),
                              fieldnames.sgidName: 'SGID10.WATER.Stations'}]  #: point to point


@patch('spreadsheet.get_datasets')
class GetCrateInfos(unittest.TestCase):
    def test_get_crate_infos(self, get_datasets_mock):
        get_datasets_mock.return_value = get_datasets_return_value
        infos = update_sgid.get_crate_infos()

        self.assertEqual(1, len(infos))
        self.assertEqual(infos[0], ('LatLong_point',
                                    test_data,
                                    settings.sgid['WATER'],
                                    'Stations'))

    def test_get_temp_crate_infos(self, get_datasets_mock):
        get_datasets_mock.return_value = get_datasets_return_value
        infos = update_sgid.get_temp_crate_infos()

        self.assertEqual(2, len(infos))
        self.assertEqual(infos[0], ('SGID10.WATER.Providers',
                                    os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')),
                                                 'settings', '..', 'databases', 'SGID10 as WATER on local.sde'),
                                    settings.tempPointsGDB,
                                    'Providers'))
        self.assertEqual(infos[1], ('LatLong',
                                    test_data,
                                    settings.tempPointsGDB,
                                    'LatLong'))


class CompareFieldNames(unittest.TestCase):
    def test_gets_fields(self):
        results = update_sgid.compare_field_names(setOne, setTwo)

        self.assertEqual(results[0], ['three', 'two'])

    def test_gets_mismatches(self):
        results = update_sgid.compare_field_names(setOne, setTwo)

        self.assertEqual(results[1], ['FOUR', 'FIVE', 'ONE'])

    def test_ignores(self):
        results = update_sgid.compare_field_names(setOne, set(['one', 'two', 'GlobalID']))

        self.assertEqual(results[0], ['two', 'one'])
        self.assertEqual(results[1], ['THREE'])


class GetSourceFields(unittest.TestCase):
    def test_adds_xy_fields(self):
        results = update_sgid.get_source_fields(['one', 'two', 'EASTING', 'three', 'NORTHING'])

        self.assertEqual(results, ['EASTING', 'NORTHING', 'one', 'two', 'EASTING', 'three', 'NORTHING'])

    def test_capitalize(self):
        results = update_sgid.get_source_fields(['one', 'two', 'Easting', 'three', 'Northing'])

        self.assertEqual(results, ['Easting', 'Northing', 'one', 'two', 'Easting', 'three', 'Northing'])


class ETL(unittest.TestCase):
    def test_creates_points(self):
        source = os.path.join(os.path.dirname(os.path.abspath(__file__)), r'data.gdb\NorthingEasting')
        sourceFields = ['EASTING', 'NORTHING', 'DERRID', 'NORTHING', 'EASTING']
        dest = source + '_point'
        destFields = ['SHAPE@XY', 'DERRID', 'NORTHING', 'EASTING']
        arcpy.TruncateTable_management(dest)

        update_sgid.etl(dest, destFields, source, sourceFields)

        self.assertEqual(arcpy.GetCount_management(dest).getOutput(0), '12')

    def test_projects_lat_longs(self):
        source = os.path.join(os.path.dirname(os.path.abspath(__file__)), r'data.gdb\LatLong')
        sourceFields = ['LONGITUDE', 'LATITUDE', 'FACILITY_NAME', 'FACILITY_NUMBER', 'LATITUDE', 'LONGITUDE']
        dest = source + '_point'
        destFields = ['SHAPE@XY', 'FACILITY_NAME', 'FACILITY_NUMBER', 'LATITUDE', 'LONGITUDE']
        arcpy.TruncateTable_management(dest)

        update_sgid.etl(dest, destFields, source, sourceFields)

        self.assertEqual(arcpy.GetCount_management(dest).getOutput(0), '427')

    def test_truncates(self):
        source = os.path.join(os.path.dirname(os.path.abspath(__file__)), r'data.gdb\Truncate')
        sourceFields = ['LONGITUDE', 'LATITUDE', 'FACILITY_NAME', 'FACILITY_NUMBER', 'LATITUDE', 'LONGITUDE', 'PROJDESC']
        dest = source + '_point'
        destFields = ['SHAPE@XY', 'FACILITY_NAME', 'FACILITY_NUMBER', 'LATITUDE', 'LONGITUDE', 'PROJDESC']
        arcpy.TruncateTable_management(dest)

        update_sgid.etl(dest, destFields, source, sourceFields)

        cur = arcpy.SearchCursor(dest)
        row = cur.next()
        self.assertEqual(len(row.PROJDESC), 2000)
        del cur, row


class ScrubCoord(unittest.TestCase):
    def test_returns_number(self):
        self.assertEqual(update_sgid.scrub_coord('123'), 123)

    def test_handles_commas(self):
        self.assertEqual(update_sgid.scrub_coord('123,345'), 123345)

    def test_handles_floats(self):
        self.assertEqual(update_sgid.scrub_coord(123.456), 123.456)
