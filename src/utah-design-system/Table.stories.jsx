import queryLayerResult from '../../tests/fixtures/queryLayerResult.json';
import Table from './Table';

export default {
  title: 'Utah Design System/Table',
  component: Table,
};

const Template = (args) => <Table {...args} caption="test caption" />;
const columns = [
  {
    accessorKey: 'OBJECTID',
  },
  {
    accessorKey: 'DERRID',
  },
  {
    accessorKey: 'SITENAME',
  },
  {
    accessorKey: 'SITEADDRES',
  },
  {
    accessorKey: 'SITECITY',
  },
  {
    accessorKey: 'SITEDESC',
  },
];

export const Default = Template.bind({});
Default.args = {
  columns,
  data: queryLayerResult.features.map((feature) => feature.attributes),
  initialState: {
    columnVisibility: {
      OBJECTID: false,
    },
  },
};

export const Scrollable = Template.bind({});
Scrollable.args = {
  columns,
  data: new Array(1000).fill(queryLayerResult.features[0].attributes),
  initialState: {
    columnVisibility: {
      OBJECTID: false,
    },
  },
  className: 'h-80',
};
