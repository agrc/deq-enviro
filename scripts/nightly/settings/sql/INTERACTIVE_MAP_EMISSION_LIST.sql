SELECT
  AI.master_ai_id AS DAQ_ID_temp,
  AI.master_ai_id AS DAQ_ID,
  AI.master_ai_name AS Company,
  AI.master_ai_name || ' ' || AI.master_ai_id AS Map_label,
  AIA.physical_address_line_1 AS Address1,
  AIA.physical_address_line_2 AS Address2,
  AIA.physical_address_line_3 AS Address3,
  AIA.physical_address_municipality AS City,
  MAX(COU.parish_or_county_desc) AS County,
  MAX(SUB.x_coord_value) AS Easting,
  MAX(SUB.y_coord_value) AS Northing,
  DSK.activity_year AS Year,
  MAX (CASE WHEN EMIS.parameter_code = 'CO' THEN EMIS.total_emission_qty ELSE NULL END) AS Carbon_Monoxide,
  MAX (CASE WHEN EMIS.parameter_code = 'NOX' THEN EMIS.total_emission_qty ELSE NULL END) AS Oxides_Nitrogen,
  MAX (CASE WHEN EMIS.parameter_code = 'NH3' THEN EMIS.total_emission_qty ELSE NULL END) AS Ammonia,
  MAX (CASE WHEN EMIS.parameter_code = 'PM10-PRI' THEN EMIS.total_emission_qty ELSE NULL END) AS Particulate_Matter_PM10,
  MAX (CASE WHEN EMIS.parameter_code = 'SOX' THEN EMIS.total_emission_qty ELSE NULL END) AS Oxides_Sulfur,
  MAX (CASE WHEN EMIS.parameter_code = 'PM25-PRI' THEN EMIS.total_emission_qty ELSE NULL END) AS PM25,
  MAX (CASE WHEN EMIS.parameter_code = 'VOC' THEN EMIS.total_emission_qty ELSE NULL END) AS Volatile_Organic_Compounds
FROM
  DSK_CENTRAL_FILE DSK
  INNER JOIN SUBJ_ITEM_AIR_EMIS_SUMMARY EMIS ON DSK.master_ai_id = EMIS.master_ai_id
    AND DSK.INT_DOC_ID = EMIS.INT_DOC_ID
    AND EMIS.SUBJECT_ITEM_CATEGORY_CODE = 'AIOO'
    AND EMIS.PARAMETER_CODE in ('PM10-PRI','SOX','NOX','VOC','CO', 'NH3', 'PM25-PRI')
 INNER JOIN AGENCY_INTEREST AI ON AI.master_ai_id = EMIS.master_ai_id
    AND AI.INT_DOC_ID = EMIS.INT_DOC_ID
  LEFT JOIN AGENCY_INTEREST_ADDRESS AIA ON AIA.master_ai_id = AI.master_ai_id
    AND AIA.int_doc_id = 0
  INNER JOIN SUBJ_ITEM_LOCATION SUB ON SUB.master_ai_id = AI.master_ai_id
    AND SUB.int_doc_id = AI.int_doc_id
  LEFT JOIN MTB_MUNICIPALITY MUN ON MUN.municipality_desc = SUB.physical_address_municipality
  LEFT JOIN MTB_PARISH_COUNTY COU ON COU.parish_or_county_code = MUN.parish_or_county_code
WHERE
  DSK.ACTIVITY_CLASS_CODE = 'INV'
  AND  DSK.ACTIVITY_YEAR = 2012
GROUP BY
  AI.master_ai_id,
  AI.master_ai_name,
  AI.master_ai_name || ' ' || AI.master_ai_id,
  AIA.physical_address_line_1,
  AIA.physical_address_line_2,
  AIA.physical_address_line_3,
  AIA.physical_address_municipality,
  DSK.activity_year
ORDER BY
  AI.master_ai_id
