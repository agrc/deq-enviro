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
  [fieldNames.queryLayers.uniqueId]: '2',
  [fieldNames.queryLayers.layerName]: 'A longer name than most',
};
const queryLayerResult3 = {
  ...queryLayerResult,
  [fieldNames.queryLayers.uniqueId]: '3',
  [fieldNames.queryLayers.layerName]: 'Different Name',
};
const errorResult = {
  ...queryLayerResult,
  [fieldNames.queryLayers.uniqueId]: '4',
  error: 'There was an error',
};
const noneFoundResult = {
  ...queryLayerResult,
  [fieldNames.queryLayers.uniqueId]: '5',
  features: [],
};
const queryLayerResult4 = {
  ...queryLayerResult,
  [fieldNames.queryLayers.uniqueId]: '6',
  [fieldNames.queryLayers.layerName]: 'No export formats',
  supportsExport: false,
};
const results = [
  queryLayerResult,
  queryLayerResult2,
  queryLayerResult3,
  queryLayerResult4,
  errorResult,
  noneFoundResult,
];

function Test({ searchResultLayers }) {
  const [selectedLayers, setSelectedLayers] = useState(['2', '3', '4', '18']);
  const [format, setFormat] = useState('csv');

  return (
    <Download
      searchResultLayers={searchResultLayers}
      selectedLayers={selectedLayers}
      setSelectedLayers={setSelectedLayers}
      format={format}
      setFormat={setFormat}
    />
  );
}

Test.propTypes = {
  searchResultLayers: Download.propTypes.searchResultLayers,
};

export const Initial = () => {
  return <Test searchResultLayers={results} />;
};

export const Busy = () => {
  return <Test searchResultLayers={results} />;
};
