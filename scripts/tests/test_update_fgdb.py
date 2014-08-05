import unittest, sys, os
import arcpy

sys.path.append(os.getcwd() + '../')
import update_fgdb

class validate_fields(unittest.TestCase):
    def test_finds_missing_fields(self):
        fieldsFromData = ['Field1', 'Field2', 'Field3']
        fieldsFromSpreadsheet = 'Field1 (Field One), Field2 (Field Two), Field4 (Field Four), Field5 (Field Five)'
        
        result = update_fgdb.validate_fields(fieldsFromData, fieldsFromSpreadsheet, 'dataset name')
        
        self.assertEqual(result, 'dataset name: Could not find matches in the source data for the following fields from the query layers spreadsheet: Field4, Field5')
        
    def test_returns_empty_array(self):
        fieldsFromData = ['Field1', 'Field2']
        fieldsFromSpreadsheet = 'Field1 (Field One), Field2 (Field Two)'
        
        result = update_fgdb.validate_fields(fieldsFromData, fieldsFromSpreadsheet, 'dataset name')
        
        self.assertEqual(result, [])
    