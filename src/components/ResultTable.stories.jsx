import queryLayerResult from '../../tests/fixtures/queryLayerResult.json';
import MapProvider from '../contexts/MapProvider';
import ResultTable from './ResultTable';

export default {
  title: 'ResultTable',
  component: ResultTable,
};

const Template = (args) => (
  <div className="relative h-80 w-full overflow-y-auto border-t border-slate-300">
    <MapProvider>
      <ResultTable {...args} />
    </MapProvider>
  </div>
);

export const Default = Template.bind({});
Default.args = {
  queryLayerResult,
  onExpandChange: console.log,
  expanded: false,
};

export const Expanded = Template.bind({});
Expanded.args = {
  queryLayerResult,
  onExpandChange: console.log,
  expanded: true,
};

export const ExpandedSingleResult = Template.bind({});
ExpandedSingleResult.args = {
  queryLayerResult: {
    ...queryLayerResult,
    features: [queryLayerResult.features[0]],
  },
  onExpandChange: console.log,
  expanded: true,
};

export const ExpandedManyRows = Template.bind({});
ExpandedManyRows.args = {
  queryLayerResult: {
    ...queryLayerResult,
    features: new Array(20000).fill(queryLayerResult.features[0]),
  },
  onExpandChange: console.log,
  expanded: true,
};

export const Error = Template.bind({});
Error.args = {
  queryLayerResult: {
    ...queryLayerResult,
    error: 'There was an error',
  },
  onExpandChange: console.log,
  expanded: false,
};

export const NoFeaturesFound = Template.bind({});
NoFeaturesFound.args = {
  queryLayerResult: {
    ...queryLayerResult,
    features: [],
  },
  onExpandChange: console.log,
  expanded: false,
};
