"""
pre1978_pallet.py

This pallet updates data in SGID.ENVIRONMENT.DAQPre1978LeadInHomes using AddressPoints and LIR parcel data.

The data for this dataset is drawn from the LIR parcels data and address points. The address-related attributes
as well as geometry is pulled from the SGID.LOCATION.AddressPoints. If this data is not available, then the script
falls back to the LIR parcel data.

The LIR parcel data is mainly used for its year built, property class, and currency data.
"""

import re
from pathlib import Path

import arcpy
from forklift.core import scratch_gdb_path
from forklift.models import Pallet

COUNTIES = {
    "Beaver": 49001,
    "BoxElder": 49003,
    "Cache": 49005,
    "Carbon": 49007,
    "Daggett": 49009,
    "Davis": 49011,
    "Duchesne": 49013,
    "Emery": 49015,
    "Garfield": 49017,
    "Grand": 49019,
    "Iron": 49021,
    "Juab": 49023,
    "Kane": 49025,
    "Millard": 49027,
    "Morgan": 49029,
    "Piute": 49031,
    "Rich": 49033,
    "SaltLake": 49035,
    "SanJuan": 49037,
    "Sanpete": 49039,
    "Sevier": 49041,
    "Summit": 49043,
    "Tooele": 49045,
    "Uintah": 49047,
    "Utah": 49049,
    "Wasatch": 49051,
    "Washington": 49053,
    "Wayne": 49055,
    "Weber": 49057,
}

fldBUILT_YR = "BUILT_YR"
fldCOUNTY = "COUNTY"
fldAPOID = "APOID"
fldPARCEL_ID = "PARCEL_ID"

FIELD_INFOS = [
    #: name, type, length
    [fldPARCEL_ID, "TEXT", 50],  #: LIR
    ["FullAdd", "TEXT", 100],  #: AddressPoints
    ["City", "TEXT", 30],  #: AddressPoints
    ["ZipCode", "TEXT", 5],  #: AddressPoints
    ["AddNum", "TEXT", 10],  #: AddressPoints
    ["PROP_CLASS", "TEXT", 100],  #: LIR
    [fldBUILT_YR, "SHORT", 4],  #: LIR
    ["CURRENT_ASOF", "DATE", 10],  #: LIR
    [fldCOUNTY, "TEXT", 15],  #: Counties (this needs to always be last)
]


class Pre1978Pallet(Pallet):
    def build(self, config):
        self.config = config
        self.sgid = Path(self.garage) / "SGID.sde"
        self.boundaries = Path(self.staging_rack) / "cadastre.gdb"

        #: build parcel crates
        self.log.info("building parcel crates")
        for county_name in COUNTIES:
            fc_name = f"SGID.CADASTRE.Parcels_{county_name}_LIR"
            lir = self.sgid / fc_name

            if not arcpy.Exists(str(lir)):
                self.log.debug(f"no LIR dataset for {county_name} county was found")
                continue

            self.add_crate(
                (fc_name.split(".")[-1], str(self.sgid), str(self.boundaries))
            )

    def generate_county_points(
        self, county_name, lir_source, address_points, zip_codes
    ):
        """Generates a scratch feature class of points for a county's pre-1978 lead in homes data.

        Returns the path to a scratch feature class whose schema matches DAQPre1978LeadInHomes.
        """
        local_lir = str(Path(scratch_gdb_path) / f"Parcels_{county_name}_LIR")
        joined = str(Path(scratch_gdb_path) / f"joined_{county_name}")
        local_points = str(Path(scratch_gdb_path) / f"points_{county_name}")
        zip_join = str(Path(scratch_gdb_path) / f"zips_{county_name}")

        self.log.debug("copying pre-1978 parcels to local scratch database")
        query = (
            f"{fldBUILT_YR} IS NOT NULL AND {fldBUILT_YR} <= 1978 AND {fldBUILT_YR} > 0"
        )
        sde_layer = arcpy.management.MakeFeatureLayer(
            lir_source, f"sde_layer_{county_name}", query
        )
        arcpy.management.CopyFeatures(sde_layer, local_lir)

        self.log.debug("copying address points for this county to local scratch")
        address_points_query = f"CountyID = '{COUNTIES[county_name]}'"
        address_points_layer = arcpy.management.MakeFeatureLayer(
            str(address_points),
            f"address_points_layer_{county_name}",
            address_points_query,
        )
        arcpy.management.CopyFeatures(address_points_layer, local_points)
        arcpy.management.AddField(local_points, fldAPOID, "TEXT", field_length=10)
        arcpy.management.CalculateField(local_points, fldAPOID, "!OBJECTID!")

        self.log.debug("creating parcels zip lookup")
        parcel_zips = {}
        arcpy.analysis.SpatialJoin(
            local_lir, str(zip_codes), zip_join, match_option="HAVE_THEIR_CENTER_IN"
        )
        with arcpy.da.SearchCursor(zip_join, ["ZIP5", "SHAPE@", fldPARCEL_ID]) as cur:
            for zip5, shape, parcel_id in cur:
                parcel_zips[parcel_id] = (zip5, shape.centroid)

        self.log.debug("creating address point shape look up")
        address_points_shapes = {}
        with arcpy.da.SearchCursor(local_points, [fldAPOID, "SHAPE@"]) as cur:
            for oid, point_shape in cur:
                address_points_shapes[oid] = point_shape

        self.log.debug("joining data with address points")
        arcpy.analysis.SpatialJoin(local_lir, local_points, joined)

        self.log.debug("creating output scratch feature class")
        output_fc = str(Path(scratch_gdb_path) / f"pre1978_{county_name}")
        spatial_ref = arcpy.Describe(local_points).spatialReference
        arcpy.management.CreateFeatureclass(
            str(Path(scratch_gdb_path)),
            f"pre1978_{county_name}",
            "POINT",
            spatial_reference=spatial_ref,
        )
        for name, field_type, length in FIELD_INFOS:
            arcpy.management.AddField(output_fc, name, field_type, field_length=length)

        joined_fields = (
            [fi[0] for fi in FIELD_INFOS if fi[0] != fldCOUNTY]
            + [fldAPOID]
            + ["PARCEL_ADD", "PARCEL_CITY"]
        )
        output_fields = [fi[0] for fi in FIELD_INFOS] + ["SHAPE@"]
        with (
            arcpy.da.SearchCursor(joined, joined_fields) as joined_cursor,
            arcpy.da.InsertCursor(output_fc, output_fields) as insert_cursor,
        ):
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
                        joined_row[4] = address.split(" ")[0][:10]

                insert_cursor.insertRow((*joined_row[:-3], county_name, shape))

        self.log.info(
            f"scratch feature class for {county_name} written to: {output_fc}"
        )

        return output_fc

    def process(self):
        if self.config == "Production":
            pre1978 = str(
                Path(self.garage)
                / "SGID_internal_connection_files"
                / "Environment.sde"
                / "SGID.ENVIRONMENT.DAQPre1978LeadInHomes"
            )
        else:
            pre1978 = str(
                Path(__file__).parent / "tests" / "data.gdb" / "DAQPre1978LeadInHomes"
            )
        address_points = self.sgid / "SGID.LOCATION.AddressPoints"
        zip_codes = self.sgid / "SGID.BOUNDARIES.ZipCodes"

        for crate in [crate for crate in self.get_crates() if crate.was_updated()]:
            match = re.search("Parcels_(.*)_LIR", crate.destination_name)
            county_name = match.group(1)

            self.log.info(f"updating pre1978 data for {county_name}")

            county_fc = self.generate_county_points(
                county_name, crate.source, address_points, zip_codes
            )

            self.log.debug(
                f"deleting data in SGID.ENVIRONMENT.DAQPre1978LeadInHomes for {county_name}"
            )
            with arcpy.da.UpdateCursor(
                pre1978, ["OID@"], f"{fldCOUNTY} = '{county_name}'"
            ) as ucur:
                for row in ucur:
                    ucur.deleteRow()

            self.log.debug("appending new data")
            arcpy.management.Append(county_fc, pre1978, "NO_TEST")


if __name__ == "__main__":
    import argparse
    import logging

    parser = argparse.ArgumentParser(
        description="Generate county points for DAQPre1978LeadInHomes."
    )
    parser.add_argument(
        "county",
        help='County name (e.g., "SaltLake").',
    )
    parser.add_argument(
        "lir_source",
        help="LIR source in hashed folder.",
    )
    parser.add_argument(
        "address_points",
        help="Path to SGID.LOCATION.AddressPoints.",
    )
    parser.add_argument(
        "zip_codes",
        help="Path to SGID.BOUNDARIES.ZipCodes.",
    )

    args = parser.parse_args()

    pallet = Pre1978Pallet()
    pallet.configure_standalone_logging(logging.DEBUG)

    pallet.generate_county_points(
        args.county,
        args.lir_source,
        args.address_points,
        args.zip_codes,
    )
