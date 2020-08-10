'''
pre1978_pallet.py

This pallet updates data in SGID.ENVIRONMENT.DAQPre1978LeadInHomes using AddressPoints and LIR parcel data.

The data for this dataset is drawn from the LIR parcels data and address points. The address-related attributes
as well as geometry is pulled from the SGID.LOCATION.AddressPoints. If this data is not available, then the script
falls back to the LIR parcel data.

The LIR parcel data is mainly use for its year built, property class and currency data.
'''

import re
from os.path import abspath, dirname, join
from textwrap import dedent

import arcpy
from forklift.core import scratch_gdb_path
from forklift.models import Pallet

COUNTIES = {
    'Beaver': 49001,
    'BoxElder': 49003,
    'Cache': 49005,
    'Carbon': 49007,
    'Daggett': 49009,
    'Davis': 49011,
    'Duchesne': 49013,
    'Emery': 49015,
    'Garfield': 49017,
    'Grand': 49019,
    'Iron': 49021,
    'Juab': 49023,
    'Kane': 49025,
    'Millard': 49027,
    'Morgan': 49029,
    'Piute': 49031,
    'Rich': 49033,
    'SaltLake': 49035,
    'SanJuan': 49037,
    'Sanpete': 49039,
    'Sevier': 49041,
    'Summit': 49043,
    'Tooele': 49045,
    'Uintah': 49047,
    'Utah': 49049,
    'Wasatch': 49051,
    'Washington': 49053,
    'Wayne': 49055,
    'Weber': 49057
}

fldBUILT_YR = 'BUILT_YR'
fldBUILT_YR_NUM = 'BUILT_YR_NUM'
fldCOUNTY = 'COUNTY'
fldAPOID = 'APOID'
fldPARCEL_ID = 'PARCEL_ID'

FIELD_INFOS = [
    #: name, type, length
    [fldPARCEL_ID, 'TEXT', 50],     #: LIR
    ['FullAdd', 'TEXT', 100],       #: AddressPoints
    ['City', 'TEXT', 30],           #: AddressPoints
    ['ZipCode', 'TEXT', 5],         #: AddressPoints
    ['AddNum', 'TEXT', 10],         #: AddressPoints
    ['PROP_CLASS', 'TEXT', 100],    #: LIR
    [fldBUILT_YR, 'SHORT', 4],      #: LIR
    ['CURRENT_ASOF', 'DATE', 10],   #: LIR
    [fldCOUNTY, 'TEXT', 15]         #: Counties (this needs to always be last)
]


class Pre1978Pallet(Pallet):
    def build(self, target):
        self.sgid = join(self.garage, 'SGID.sde')
        self.boundaries = join(self.staging_rack, 'cadastre.gdb')

        #: build parcel crates
        self.log.info('building parcel crates')
        for county in COUNTIES:
            fc_name = 'SGID.CADASTRE.Parcels_{}_LIR'.format(county)
            lir = join(self.sgid, fc_name)

            if not arcpy.Exists(lir):
                self.log.debug('no LIR dataset for {} county was found'.format(county))
                continue

            self.add_crate((fc_name.split('.')[-1], self.sgid, self.boundaries))

    def process(self):
        pre1978 = join(self.garage, 'SGID as ENVIRONMENT.sde', 'SGID.ENVIRONMENT.DAQPre1978LeadInHomes')
        address_points = join(self.sgid, 'SGID.LOCATION.AddressPoints')
        zip_codes = join(self.sgid, 'SGID.BOUNDARIES.ZipCodes')

        for crate in [crate for crate in self.get_crates() if crate.was_updated()]:
            match = re.search('Parcels_(.*)_LIR', crate.destination_name)
            county = match.group(1)

            self.log.info('updating pre1978 data for {}'.format(county))

            local_lir = join(scratch_gdb_path, 'Parcels_{}_LIR'.format(county))
            joined = join(scratch_gdb_path, 'joined_{}'.format(county))
            local_points = join(scratch_gdb_path, 'points_{}'.format(county))
            zip_join = join(scratch_gdb_path, 'zips_{}'.format(county))

            self.log.debug('copying parcels to local scratch database')
            sde_layer = arcpy.management.MakeFeatureLayer(crate.source,
                                                          'sde_layer_{}'.format(county),
                                                          '{0} IS NOT NULL AND NOT {0} IN (\'\', \' \')'
                                                          .format(fldBUILT_YR))
            arcpy.management.CopyFeatures(sde_layer, local_lir)

            self.log.debug('adding and populating {} field'.format(fldBUILT_YR_NUM))
            arcpy.management.AddField(local_lir, fldBUILT_YR_NUM, 'SHORT')
            codeblock = dedent("""
            def getYear(value):
                try:
                    return int(value)
                except:
                    return None
            """)
            arcpy.management.CalculateField(local_lir,
                                            fldBUILT_YR_NUM,
                                            'getYear(!{}!)'.format(fldBUILT_YR),
                                            code_block=codeblock)

            self.log.debug('selecting pre-1978 data')
            query = '{0} IS NOT NULL AND {0} <= 1978 AND {0} > 0'.format(fldBUILT_YR_NUM)
            lir_layer = arcpy.management.MakeFeatureLayer(local_lir, 'lir_layer_{}'.format(county), query)

            self.log.debug('copying address points for this county to local scratch')
            address_points_query = 'CountyID = \'{}\''.format(COUNTIES[county])
            address_points_layer = arcpy.management.MakeFeatureLayer(address_points,
                                                                     'address_points_layer_{}'.format(county),
                                                                     address_points_query)
            arcpy.management.CopyFeatures(address_points_layer, local_points)
            arcpy.management.AddField(local_points, fldAPOID, 'TEXT', field_length=10)
            arcpy.management.CalculateField(local_points, fldAPOID, '!OBJECTID!')

            self.log.debug('creating parcels zip lookup')
            parcel_zips = {}
            arcpy.analysis.SpatialJoin(local_lir, zip_codes, zip_join, match_option='HAVE_THEIR_CENTER_IN')
            with arcpy.da.SearchCursor(zip_join, ['ZIP5', 'SHAPE@', fldPARCEL_ID]) as cur:
                for zip, shape, id in cur:
                    parcel_zips[id] = (zip, shape.centroid)

            self.log.debug('creating address point shape look up')
            address_points_shapes = {}
            with arcpy.da.SearchCursor(local_points, [fldAPOID, 'SHAPE@']) as cur:
                for oid, shape in cur:
                    address_points_shapes[oid] = shape

            self.log.debug('joining data with address points')
            arcpy.analysis.SpatialJoin(lir_layer,
                                       local_points,
                                       joined)

            self.log.debug('deleting data in SGID.ENVIRONMENT.DAQPre1978LeadInHomes for {}'.format(county))
            with arcpy.da.UpdateCursor(pre1978, ['OID@'], '{} = \'{}\''.format(fldCOUNTY, county)) as ucur:
                for row in ucur:
                    ucur.deleteRow()

            self.log.debug('populating with new data')
            joined_fields = [fi[0] for fi in FIELD_INFOS if fi[0] != fldCOUNTY] + \
                [fldAPOID] + ['PARCEL_ADD', 'PARCEL_CITY']
            with arcpy.da.SearchCursor(joined, joined_fields) as joined_cursor, \
                    arcpy.da.InsertCursor(pre1978, [fi[0] for fi in FIELD_INFOS] + ['SHAPE@']) as insert_cursor:
                for joined_row in joined_cursor:
                    try:
                        shape = address_points_shapes[joined_row[-3]]
                    except KeyError:
                        joined_row = list(joined_row)
                        address, city = joined_row[-2:]
                        joined_row[1] = address
                        joined_row[2] = city
                        zip, point = parcel_zips[joined_row[0]]
                        joined_row[3] = zip
                        shape = point

                        if address is not None:
                            joined_row[4] = address.split(' ')[0][:10]

                    insert_cursor.insertRow((*joined_row[:-3], county, shape))
