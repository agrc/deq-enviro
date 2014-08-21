import unittest, sys, os
import arcpy

sys.path.append(os.getcwd() + '../')
import update_sgid

setOne = set(['one', 'two', 'three'])
setTwo = set(['two', 'three', 'four', 'five'])
class compare_field_names(unittest.TestCase):
    def test_gets_fields(self):
        results = update_sgid.compare_field_names(setOne, setTwo)
        
        self.assertEqual(results[0], ['three', 'two'])
        
    def test_gets_mismatches(self):
        results = update_sgid.compare_field_names(setOne, setTwo)
        
        self.assertEqual(results[1], ['four', 'five', 'one'])

    def test_ignores(self):
        results = update_sgid.compare_field_names(setOne, set(['one', 'two', 'GlobalID']))
        
        self.assertEqual(results[0], ['two', 'one'])
        self.assertEqual(results[1], ['three'])

class get_source_fields(unittest.TestCase):
    def test_adds_xy_fields(self):
        results = update_sgid.get_source_fields(['one', 'two', 'EASTING', 'three', 'NORTHING'])
        
        self.assertEqual(results, ['EASTING', 'NORTHING', 'one', 'two', 'EASTING', 'three', 'NORTHING'])
    
    def test_capitalize(self):
        results = update_sgid.get_source_fields(['one', 'two', 'Easting', 'three', 'Northing'])
        
        self.assertEqual(results, ['Easting', 'Northing', 'one', 'two', 'Easting', 'three', 'Northing'])
class etl(unittest.TestCase):
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
        sourceFields = ['LONGITUDE', 'LATITUDE' , 'FACILITY_NAME', 'FACILITY_NUMBER', 'LATITUDE', 'LONGITUDE', 'PROJDESC']
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
