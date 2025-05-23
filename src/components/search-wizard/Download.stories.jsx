import PropTypes from 'prop-types';
import { useState } from 'react';
import { fieldNames } from '../../../functions/common/config';
import queryLayerResult from '../../../tests/fixtures/queryLayerResult.json';
import Download from './Download';

export default {
  title: 'Download',
  component: Download,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

const queryLayerResult2 = {
  ...queryLayerResult,
  [fieldNames.queryLayers.tableName]: 'TableName',
  [fieldNames.queryLayers.layerName]: 'A longer name than most',
};
const queryLayerResult3 = {
  ...queryLayerResult,
  [fieldNames.queryLayers.tableName]: 'TableNameAgain',
  [fieldNames.queryLayers.layerName]: 'Different Name',
};
const errorResult = {
  ...queryLayerResult,
  [fieldNames.queryLayers.tableName]: 'SomeTable',
  error: 'There was an error',
};
const noneFoundResult = {
  ...queryLayerResult,
  [fieldNames.queryLayers.tableName]: 'BlahTable',
  features: [],
};
const queryLayerResult4 = {
  ...queryLayerResult,
  [fieldNames.queryLayers.tableName]: 'FromTable',
  [fieldNames.queryLayers.layerName]: 'No export formats',
};
const results = {
  Brownfields: queryLayerResult,
  TableName: queryLayerResult2,
  TableNameAgain: queryLayerResult3,
  SomeTable: queryLayerResult4,
  BlahTable: errorResult,
  FromTable: noneFoundResult,
};

function Test({ searchResultLayers }) {
  const [selectedLayers, setSelectedLayers] = useState([
    'TableName',
    'TableNameAgain',
    'SomeTable',
    'AnotherTable',
  ]);
  const [format, setFormat] = useState('csv');

  return (
    <Download
      searchResultLayers={searchResultLayers}
      selectedLayers={selectedLayers}
      setSelectedLayers={setSelectedLayers}
      format={format}
      setFormat={setFormat}
      error={null}
    />
  );
}

Test.propTypes = {
  searchResultLayers: PropTypes.object.isRequired,
};

export const Initial = () => {
  return <Test searchResultLayers={results} />;
};
