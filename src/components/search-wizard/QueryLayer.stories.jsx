import QueryLayer from './QueryLayer';

export default {
  title: 'SearchWizard/QueryLayer',
  component: QueryLayer,
};

const config = {
  index: 0,
  Name: 'Public Water System Facilities',
  'SGID Feature Class Name': 'DirectFrom.Source.WSFacilities',
  Secure: 'Yes',
  'Geometry Type': 'point',
  'Division Heading': 'Drinking Water',
  'Layer Description':
    'Wells, springs and surface-water intakes used by public water systems.',
  'Metadata Link':
    'https://71dvtvplh8.execute-api.us-west-2.amazonaws.com/PROD/deq-interactive-maps-docs?doc-id=PublicWaterSystemFacs_Metadata.pdf',
  'Special Filters': 'n/a',
  'Special Filter Default To On': 'N',
  'Additional Searches': 'n/a',
  'OID Field': '',
  ID: 'SYSFACID',
  NAME: 'FACNAME',
  ADDRESS: 'SYSNUMBER',
  CITY: 'SYSNAME',
  TYPE: 'FACTYPEDESC',
  'Custom Symbology Field': 'n/a',
  'Legend Title': 'n/a',
  'Map Label Field': 'SYSFACID',
  'Sort Field': 'n/a',
  'Identify Attributes':
    'SYSFACID (System-Facility ID), SYSNUMBER (System Number), SYSNAME (System Name), FACID (Facility Identifier), FACNAME (Facility Name), FACTYPEDESC (Facility Type Description), FACTYPECODE (Facility Type Code), FACACTIVITY (Facility Activity Status), SYSTYPE (System Type), SYSACTIVITY (System Activity Status), SYSPOPULATION (System Population), SYSPOPWHSALE (System Wholesale Population), SYSPHONE (System Phone), SYSPHONEEXT (System Phone Extension), SYSADDRESS1 (System Address1), SYSADDRESS2 (System Address2), SYSCITY (System City), SYSSTATE (System State), SYSZIP (System ZIP Code)\\n',
  'Related Tables': 'None',
  'Document Search':
    'http://168.178.6.56/TabsPage.aspx?AI_PageConfigID=100001&DivName=DDW',
  'GRAMA Request':
    'https://deq.utah.gov/general/records-request-government-records-access-and-management-act-grama',
  'Permit Information':
    'http://168.178.6.56/TabsPage.aspx?AI_PageConfigID=100123&DivName=DAQ',
  'Additional Information':
    'http://168.178.6.56/TabsPage.aspx?AI_PageConfigID=100003&DivName=DDW',
  Comments: '',
  'Feature Service': '',
  'Coded Values': '',
};
export const Default = () => (
  <div className="w-80">
    <QueryLayer
      config={config}
      selected={false}
      onSelectedChange={console.log}
      filter={null}
      onFilterChange={console.log}
    />
    <QueryLayer
      config={config}
      selected={true}
      onSelectedChange={console.log}
      filter={null}
      onFilterChange={console.log}
    />
  </div>
);
