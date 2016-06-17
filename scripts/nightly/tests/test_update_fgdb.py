import unittest
import settings
import sys
import os
from forklift.exceptions import ValidationException
from mock import patch
from mock import Mock
from settings import fieldnames

sys.path.append(os.getcwd() + '../')
import update_fgdb


test_data = os.path.join(os.path.dirname(__file__), 'data.gdb')
queryLayer = {}
queryLayer[fieldnames.ID] = 'Field1'
queryLayer[fieldnames.NAME] = 'Field1'
queryLayer[fieldnames.ADDRESS] = 'Field1'
queryLayer[fieldnames.CITY] = 'Field1'
queryLayer[fieldnames.TYPE] = 'Field1'
queryLayer[fieldnames.ENVIROAPPLABEL] = 'Field1'
queryLayer[fieldnames.ENVIROAPPSYMBOL] = 'Field1'


@patch('update_fgdb.get_spreadsheet_config_from_crate')
@patch('arcpy.ListFields')
class ValidateFields(unittest.TestCase):
    def test_finds_missing_fields(self, list_fields_mock, get_config_mock):
        field1 = Mock()
        field1.name = 'Field1'
        field2 = Mock()
        field2.name = 'Field2'
        field3 = Mock()
        field3.name = 'Field3'
        list_fields_mock.return_value = [field1, field2, field3]

        queryLayer[fieldnames.fields] = 'Field1 (Field One), Field2 (Field Two), Field4 (Field Four), Field5 (Field Five)'
        get_config_mock.return_value = queryLayer

        crate = Mock()
        crate.destination_name = 'name'

        self.assertRaises(ValidationException, update_fgdb.validate_crate, crate)

    def test_returns_empty_array(self, list_fields_mock, get_config_mock):
        field1 = Mock()
        field1.name = 'Field1'
        field2 = Mock()
        field2.name = 'Field2'
        field3 = Mock()
        field3.name = 'Field3'
        list_fields_mock.return_value = [field1, field2, field3]

        queryLayer[fieldnames.fields] = 'Field1 (Field One), Field2 (Field Two)'
        get_config_mock.return_value = queryLayer

        crate = Mock()
        crate.destination_name = 'name'

        self.assertTrue(update_fgdb.validate_crate(crate))

get_datasets_return_value = [{fieldnames.sourceData: r'\\168.178.43.239\GIS\DWGIS\DWDATA\DWPUBLIC.gdb\SourceWaterProtection\GroundWaterZones',
                              fieldnames.sgidName: 'DirectFrom.Source.GroundWaterZones'},
                             {fieldnames.sourceData: os.path.join(test_data, 'LatLong'),
                              fieldnames.sgidName: 'SGID10.WATER.Stations'},  #: table to point
                             {fieldnames.sourceData: '<updated through ogm script at 4:15 AM daily>',
                              fieldnames.sgidName: 'SGID10.ENERGY.DNROilGasWells'},
                             {fieldnames.sourceData: os.path.join(test_data, 'LatLong_point'),
                              fieldnames.sgidName: 'SGID10.WATER.Stations'}]  #: point to point


@patch('spreadsheet.get_datasets')
class GetCrateInfos(unittest.TestCase):
    def test(self, get_datasets_mock):
        get_datasets_mock.return_value = get_datasets_return_value

        infos = update_fgdb.get_crate_infos()

        self.assertEqual(4, len(infos))
        self.assertEqual(infos[0], (r'SourceWaterProtection\GroundWaterZones',
                                    r'\\168.178.43.239\GIS\DWGIS\DWDATA\DWPUBLIC.gdb',
                                    settings.fgd,
                                    'GroundWaterZones'))
        self.assertEqual(infos[1], (r'SGID10.WATER.Stations',
                                    settings.sgid['WATER'],
                                    settings.fgd,
                                    'Stations'))
        self.assertEqual(infos[2], (r'SGID10.ENERGY.DNROilGasWells',
                                    settings.sgid['ENERGY'],
                                    settings.fgd,
                                    'DNROilGasWells'))


@patch('spreadsheet.get_datasets')
class GetSpreadsheetConfigFromCrate(unittest.TestCase):
    def test(self, get_datasets_mock):
        get_datasets_mock.return_value = get_datasets_return_value

        crate = Mock()
        crate.destination_name = 'GroundWaterZones'
        ql = update_fgdb.get_spreadsheet_config_from_crate(crate)
        self.assertEqual('DirectFrom.Source.GroundWaterZones', ql[fieldnames.sgidName])
