SELECT
  AI.master_ai_id AS DAQ_id_temp,
  AI.master_ai_id AS DAQ_id,
  AI.master_ai_name AS NAME,
  AI.master_ai_name || ' ' || AI.master_ai_id AS Map_Label,
  AIA.physical_address_line_1 AS Site_Address_1,
  AIA.physical_address_line_2 AS Site_Address_2,
  AIA.physical_address_line_3 AS Site_Address_3,
  AIA.physical_address_municipality AS Site_City,
  AIA.physical_address_state_code AS Site_State,
  AIA.physical_address_zip AS Site_Zip,
  AIA.mailing_address_line_1 AS Site_Mailing_Address_1,
  AIA.mailing_address_line_2 AS Site_Mailing_Address_2,
  AIA.mailing_address_line_3 AS Site_Mailing_Address_3,
  AIA.mailing_address_municipality AS Site_Mailing_City,
  AIA.mailing_address_state_code AS Site_Mailing_State,
  AIA.mailing_address_zip AS Site_Mailing_Zip,
  MAX(SUB.x_coord_value) AS EASTING,
  MAX(SUB.y_coord_value) AS NORTHING,
  MAX(SUB.coordinate_system_code) AS UTM_Zone,
  MAX(COU.parish_or_county_desc) AS Site_County,
  MAX(O.master_org_name) AS Own_Operator_Name,
  MAX(OA.mailing_address_line_1) AS Own_Operator_Mailing_Address_1,
  MAX(OA.mailing_address_line_2) AS Own_Operator_Mailing_Address_2,
  MAX(OA.mailing_address_line_3) AS Own_Operator_Mailing_Address_3,
  MAX(OA.mailing_address_municipality) AS Own_Operator_Mailing_City,
  MAX(OA.mailing_address_state_code) AS Own_Operator_Mailing_State,
  MAX(OA.mailing_address_zip) AS Own_Operator_Mailing_Zip,
  MAX(CASE WHEN (DSK.title_desc) IS NOT NULL THEN 'Approval Orders/NSR' ELSE '' END) AS Permit_Issued
FROM
  AGENCY_INTEREST AI
  INNER JOIN AGENCY_INTEREST_ADDRESS AIA ON AIA.master_ai_id = AI.master_ai_id
    AND AI.int_doc_id = AIA.int_doc_id
    AND AIA.int_doc_id = 0
  INNER JOIN DSK_CENTRAL_FILE DSK ON DSK.master_ai_id = AI.master_ai_id
    AND DSK.title_desc LIKE 'AN%'
  INNER JOIN SUBJ_ITEM_LOCATION SUB ON SUB.master_ai_id = AI.master_ai_id
    AND SUB.int_doc_id = AI.int_doc_id
    AND (SUB.x_coord_value IS NOT NULL AND SUB.y_coord_value IS NOT NULL)
  LEFT JOIN MTB_MUNICIPALITY MUN ON MUN.municipality_desc = SUB.physical_address_municipality
  LEFT JOIN MTB_PARISH_COUNTY COU ON COU.parish_or_county_code = MUN.parish_or_county_code
  LEFT JOIN AGENCY_INTEREST_ORG_XREF XREF ON XREF.master_ai_id = AI.master_ai_id
    AND XREF.int_doc_id = 0
    AND XREF.relationship_code = 'fg'
  LEFT JOIN ORGANIZATION O ON O.master_org_id = XREF.master_org_id
  LEFT JOIN ORGANIZATION_ADDRESS OA ON OA.master_org_id = O.master_org_id
    AND OA.int_doc_id = 0
WHERE
  AI.master_ai_id <> 500
GROUP BY
  AI.master_ai_id,
  AI.master_ai_name,
  AIA.physical_address_line_1,
  AIA.physical_address_line_2,
  AIA.physical_address_line_3,
  AIA.physical_address_municipality,
  AIA.physical_address_state_code,
  AIA.physical_address_zip,
  AIA.mailing_address_line_1,
  AIA.mailing_address_line_2,
  AI.master_ai_name || ' ' || AI.master_ai_id,
  AIA.mailing_address_line_3,
  AIA.mailing_address_municipality,
  AIA.mailing_address_state_code,
  AIA.mailing_address_zip
