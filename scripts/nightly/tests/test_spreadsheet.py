import unittest
import sys
import os

sys.path.append(os.getcwd() + '../')
import spreadsheet
from settings import fieldnames


class SpreadsheetTests(unittest.TestCase):
    def test_get_query_layers(self):
        ql = spreadsheet.get_query_layers()

        self.assertEqual(len(ql), 33)

        l = ql[4]

        # a few of the fields
        self.assertEqual(l[fieldnames.ID], 'CUZONE')
        self.assertEqual(l[fieldnames.sourceData], r'\\168.178.43.239\GIS\DWGIS\DWDATA\DWPUBLIC.gdb\ConsumUseZones')
        self.assertEqual(l[fieldnames.sgidName], 'SGID10.WATER.DDWIrrigatedCropConsumptiveUseZones')

    def test_get_related_tables(self):
        tbls = spreadsheet.get_related_tables()

        self.assertEqual(len(tbls), 15)

        t = tbls[0]

        self.assertEqual(t[fieldnames.sourceData], r'ustdata.sde\USTDATA.dbo.FMSTankUst')
        self.assertEqual(t[fieldnames.sgidName], 'SGID10.ENVIRONMENT.DEQMAP_TANKUST')

    def test_get_links(self):
        links = spreadsheet.get_links()

        self.assertEqual(len(links), 2)

        l = links[0]

        self.assertEqual(l[fieldnames.ID], '1')
        self.assertEqual(l[fieldnames.url], r'http://168.178.6.23/TabsPage.aspx?AI_PageConfigID=602714&DivName=All')

    def test_get_datasets(self):
        self.assertEqual(len(spreadsheet.get_datasets()), 49)
