import queryLayerResult from '../../tests/fixtures/queryLayerResult.json';
import ResultTable from './ResultTable';

export default {
  title: 'ResultTable',
  component: ResultTable,
};

const Template = (args) => (
  <div className="h-80 border border-slate-300">
    <ResultTable {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  queryLayerResult,
};

export const Error = Template.bind({});
Error.args = {
  queryLayerResult: {
    ...queryLayerResult,
    error: 'There was an error',
  },
};

export const NoFeaturesFound = Template.bind({});
NoFeaturesFound.args = {
  queryLayerResult: {
    ...queryLayerResult,
    features: [],
  },
};
