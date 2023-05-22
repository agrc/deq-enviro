import PropTypes from 'prop-types';
import { fieldNames } from '../../../functions/common/config';
import Checkbox from '../../utah-design-system/Checkbox';
import Icon from '../../utah-design-system/Icon';
import Tooltip from '../../utah-design-system/Tooltip';

/*
Example config:
{
  "Unique ID": 0,
  "Layer Name": "Public Water System Facilities",
  "SGID Feature Class Name": "DirectFrom.Source.WSFacilities",
  "Secure": "Yes",
  "Geometry Type": "point",
  "Division Heading": "Drinking Water",
  "Layer Description": "Wells, springs and surface-water intakes used by public water systems.",
  "Metadata Link": "https://71dvtvplh8.execute-api.us-west-2.amazonaws.com/PROD/deq-interactive-maps-docs?doc-id=PublicWaterSystemFacs_Metadata.pdf",
  "Special Filters": "n/a",
  "Special Filter Default To On": "N",
  "Additional Searches": "n/a",
  "OID Field": "",
  "ID": "SYSFACID",
  "NAME": "FACNAME",
  "ADDRESS": "SYSNUMBER",
  "CITY": "SYSNAME",
  "TYPE": "FACTYPEDESC",
  "Custom Symbology Field": "n/a",
  "Legend Title": "n/a",
  "Map Label Field": "SYSFACID",
  "Sort Field": "n/a",
  "Identify Attributes": "SYSFACID (System-Facility ID), SYSNUMBER (System Number), SYSNAME (System Name), FACID (Facility Identifier), FACNAME (Facility Name), FACTYPEDESC (Facility Type Description), FACTYPECODE (Facility Type Code), FACACTIVITY (Facility Activity Status), SYSTYPE (System Type), SYSACTIVITY (System Activity Status), SYSPOPULATION (System Population), SYSPOPWHSALE (System Wholesale Population), SYSPHONE (System Phone), SYSPHONEEXT (System Phone Extension), SYSADDRESS1 (System Address1), SYSADDRESS2 (System Address2), SYSCITY (System City), SYSSTATE (System State), SYSZIP (System ZIP Code)\\n",
  "Related Tables": "None",
  "Document Search": "https://documents.deq.utah.gov/TabsPage.aspx?AI_PageConfigID=100001&DivName=DDW",
  "GRAMA Request": "https://deq.utah.gov/general/records-request-government-records-access-and-management-act-grama",
  "Permit Information": "https://documents.deq.utah.gov/TabsPage.aspx?AI_PageConfigID=100123&DivName=DAQ",
  "Additional Information": "https://documents.deq.utah.gov/TabsPage.aspx?AI_PageConfigID=100003&DivName=DDW",
  "Comments": "",
  "Feature Service": "",
  "Coded Values": ""
}
*/
export default function QueryLayer({
  config,
  selected,
  onSelectedChange,
  // filter,
  // onFilterChange,
}) {
  const id = `query-layer-${config[fieldNames.queryLayers.uniqueId]}`;

  return (
    <div className="my-2 flex items-center justify-between">
      <Tooltip
        delayDuration={1000}
        trigger={
          <span>
            <Checkbox
              name={id}
              label={config[fieldNames.queryLayers.layerName]}
              onCheckedChange={onSelectedChange}
              checked={selected}
            />
          </span>
        }
      >
        <div className="max-w-md">
          {config[fieldNames.queryLayers.layerDescription]}
        </div>
      </Tooltip>
      {config[fieldNames.queryLayers.metadataLink] ? (
        <Tooltip
          trigger={
            <a
              href={config[fieldNames.queryLayers.metadataLink]}
              target="_blank"
              rel="noreferrer"
            >
              <Icon
                name={Icon.Names.externalLink}
                className="text-slate-600"
                label="more info"
                size="xs"
              />
            </a>
          }
        >
          More Info
        </Tooltip>
      ) : null}
    </div>
  );
}

QueryLayer.propTypes = {
  config: PropTypes.object.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelectedChange: PropTypes.func.isRequired,
  // filter: PropTypes.object,
  // onFilterChange: PropTypes.func.isRequired,
};
