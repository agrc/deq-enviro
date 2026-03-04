"""
build_pre1978.py

Builds a statewide DAQPre1978LeadInHomes feature class from scratch by looping
through all Utah counties, downloading LIR parcel data from an SDE connection,
and running the same county-level point generation logic used by Pre1978Pallet.

Usage:
    python build_pre1978.py <output_gdb> <sgid_sde> <address_points> <zip_codes>

Arguments:
    output_gdb      Path to an existing file geodatabase where the output
                    feature class will be created.
    sgid_sde        Path to the .sde connection file containing the LIR parcel
                    data (e.g. SGID.CADASTRE.Parcels_SaltLake_LIR).
    address_points  Full path to SGID.LOCATION.AddressPoints (SDE or local).
    zip_codes       Full path to SGID.BOUNDARIES.ZipCodes (SDE or local).
"""

import argparse
import logging
import sys
from pathlib import Path

import arcpy

from pre1978_pallet import COUNTIES, FIELD_INFOS, Pre1978Pallet


def create_output_fc(output_gdb: str, address_points: str) -> str:
    """Creates an empty DAQPre1978LeadInHomes feature class in output_gdb.

    The spatial reference is derived from the address_points dataset.
    Returns the full path to the created feature class.
    """
    fc_name = "DAQPre1978LeadInHomes"
    output_fc = str(Path(output_gdb) / fc_name)

    if arcpy.Exists(output_fc):
        raise FileExistsError(
            f"{output_fc} already exists. Delete it before running this script."
        )

    spatial_ref = arcpy.Describe(address_points).spatialReference
    arcpy.management.CreateFeatureclass(
        output_gdb,
        fc_name,
        "POINT",
        spatial_reference=spatial_ref,
    )

    for name, field_type, length in FIELD_INFOS:
        arcpy.management.AddField(output_fc, name, field_type, field_length=length)

    return output_fc


def main(args: argparse.Namespace) -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)-8s %(message)s",
        datefmt="%H:%M:%S",
        stream=sys.stdout,
    )
    log = logging.getLogger(__name__)

    log.info("creating output feature class")
    output_fc = create_output_fc(args.output_gdb, args.address_points)
    log.info(f"output feature class created: {output_fc}")

    pallet = Pre1978Pallet()
    pallet.configure_standalone_logging(logging.DEBUG)

    failed_counties = []

    for county_name in COUNTIES:
        lir_source = str(
            Path(args.sgid_sde) / f"SGID.CADASTRE.Parcels_{county_name}_LIR"
        )

        if not arcpy.Exists(lir_source):
            log.warning(f"no LIR dataset found for {county_name} county — skipping")
            continue

        log.info(f"processing {county_name} county")
        try:
            county_fc = pallet.generate_county_points(
                county_name,
                lir_source,
                args.address_points,
                args.zip_codes,
            )
            arcpy.management.Append(county_fc, output_fc, "NO_TEST")
            count = int(arcpy.management.GetCount(county_fc)[0])
            log.info(f"{county_name}: appended {count:,} records")
        except Exception:
            log.exception(f"failed to process {county_name} county")
            failed_counties.append(county_name)

    total = int(arcpy.management.GetCount(output_fc)[0])
    log.info(f"done — {total:,} total records written to {output_fc}")

    if failed_counties:
        log.warning(f"counties with errors: {', '.join(failed_counties)}")
        sys.exit(1)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build a statewide DAQPre1978LeadInHomes feature class."
    )
    parser.add_argument(
        "output_gdb",
        help="Path to an existing file geodatabase where the output FC will be created.",
    )
    parser.add_argument(
        "sgid_sde",
        help="Path to the .sde connection file containing LIR parcel feature classes.",
    )
    parser.add_argument(
        "address_points",
        help="Full path to SGID.LOCATION.AddressPoints.",
    )
    parser.add_argument(
        "zip_codes",
        help="Full path to SGID.BOUNDARIES.ZipCodes.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    main(parse_args())
