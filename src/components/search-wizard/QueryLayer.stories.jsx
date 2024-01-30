import QueryLayer from './QueryLayer';

export default {
  title: 'QueryLayer',
  component: QueryLayer,
};

/** @type {import('../../../functions/common/config').QueryLayerConfig} */
const config = {
  'Table Name': 'Facilities',
  'Layer Name': 'Public Water System Facilities',
  'Geometry Type': 'point',
  'Division Heading': 'Drinking Water',
  'Layer Description':
    'Wells, springs and surface-water intakes used by public water systems.',
  'Metadata Link':
    'https://71dvtvplh8.execute-api.us-west-2.amazonaws.com/PROD/deq-interactive-maps-docs?doc-id=PublicWaterSystemFacs_Metadata.pdf',
  'Special Filters': [],
  'Special Filter Default To On': false,
  'Additional Searches': 'n/a',
  'OID Field': '',
  ID: 'SYSFACID',
  NAME: 'FACNAME',
  'Custom Symbology Field': 'n/a',
  'Legend Title': 'n/a',
  'Map Label Field': 'SYSFACID',
  'Sort Field': 'n/a',
  'Identify Fields': [
    'SYSFACID (System-Facility ID)',
    'SYSNUMBER (System Number)',
    'SYSNAME (System Name)',
    'FACID (Facility Identifier)',
    'FACNAME (Facility Name)',
    'FACTYPEDESC (Facility Type Description)',
    'FACTYPECODE (Facility Type Code)',
    'FACACTIVITY (Facility Activity Status)',
    'SYSTYPE (System Type)',
    'SYSACTIVITY (System Activity Status)',
    'SYSPOPULATION (System Population)',
    'SYSPOPWHSALE (System Wholesale Population)',
    'SYSPHONE (System Phone)',
    'SYSPHONEEXT (System Phone Extension)',
    'SYSADDRESS1 (System Address1)',
    'SYSADDRESS2 (System Address2)',
    'SYSCITY (System City)',
    'SYSSTATE (System State)',
    'SYSZIP (System ZIP Code)',
  ],
  'Related Tables': 'None',
  'Result Grid Fields': [],
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

/** @type {import('../../../functions/common/config').QueryLayerConfig} */
const noMetaLinkConfig = {
  ...config,
  'Layer Name': 'No Metadata Link',
  'Metadata Link': null,
};

/** @type {import('../../../functions/common/config').QueryLayerConfig} */
const filterConfig = {
  ...config,
  'Layer Name': 'Filter',
  'Special Filters': [
    {
      type: 'checkbox',
      options: [
        {
          value: "ASSESSMENT = '1: Supports all designated uses'",
          alias: '1: Supports all designated uses',
        },
        {
          value: "ASSESSMENT = '2: Supports all assessed uses'",
          alias: '2: Supports all assessed uses',
        },
      ],
    },
  ],
};

export const Default = () => (
  <div className="w-80">
    <QueryLayer
      config={config}
      selected={false}
      onSelectedChange={console.log}
      filterValues={undefined}
      onFiltersChange={console.log}
    />
    <QueryLayer
      config={config}
      selected={true}
      onSelectedChange={console.log}
      filterValues={undefined}
      onFiltersChange={console.log}
    />
    <QueryLayer
      config={noMetaLinkConfig}
      selected={false}
      onSelectedChange={console.log}
      filterValues={undefined}
      onFiltersChange={console.log}
    />
    <QueryLayer
      config={filterConfig}
      selected={false}
      onSelectedChange={console.log}
      filterValues={undefined}
      onFiltersChange={console.log}
    />
    <QueryLayer
      config={filterConfig}
      selected={false}
      onSelectedChange={console.log}
      filterValues={[
        {
          type: 'checkbox',
          values: ["ASSESSMENT = '1: Supports all designated uses'"],
        },
      ]}
      onFiltersChange={console.log}
    />
  </div>
);
