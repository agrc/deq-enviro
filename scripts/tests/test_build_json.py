import unittest, sys, os

sys.path.append(os.getcwd() + '../')
import build_json
from settings import fieldnames

class BuildJSONTests(unittest.TestCase):
    def test_builds_json_object(self):
        json = build_json.run()
        
        self.assertEqual(len(json[fieldnames.queryLayers]), 34)
        self.assertEqual(len(json[fieldnames.otherLinks]), 2)
        
    def test_adds_layer_indices(self):
        lyr = build_json.run()[fieldnames.queryLayers][15]
        
        self.assertEqual(lyr[fieldnames.index], 5)
    def test_parse_fields(self):
        txt = 'SYSFACID (System-Facility ID), FACTYPECODE (Facility Type Code), FACACTIVITY (Facility Activity Status)'
        
        result = build_json.parse_fields(txt)
        
        self.assertEqual(len(result), 3)
        self.assertEqual(result[0], ['SYSFACID', 'System-Facility ID'])
        self.assertEqual(result[2], ['FACACTIVITY', 'Facility Activity Status'])
        
    def test_parse_fields_handles_nested_parentheses(self):
        txt = 'Easting (UTM_Easting), Year (Year), Carbon_Monoxide (Carbon Monoxide (TONS/YR)), Oxides_Nitrogen (Oxides of Nitrogen (TONS/YR))'
        
        result = build_json.parse_fields(txt)
        
        self.assertEqual(result[2], ['Carbon_Monoxide', 'Carbon Monoxide (TONS/YR)'])
        self.assertEqual(len(result), 4)
        self.assertEqual(result[0], ['Easting', 'UTM_Easting'])