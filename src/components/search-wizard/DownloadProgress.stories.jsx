import { fieldNames } from '../../../functions/common/config';
import queryLayerResult from '../../../tests/fixtures/queryLayerResult.json';
import DownloadProgress from './DownloadProgress';

export default {
  title: 'DownloadProgress',
  component: DownloadProgress,
  decorators: [
    (Story) => (
      <div className="w-80 border">
        <Story />
      </div>
    ),
  ],
};

/** @type {import('../../../functions/common/config').QueryLayerConfig} */
const queryLayerResult2 = {
  ...queryLayerResult,
  [fieldNames.queryLayers.tableName]: 'TableName',
  [fieldNames.queryLayers.layerName]: 'A longer name than most',
};
const queryLayerResult3 = {
  ...queryLayerResult,
  [fieldNames.queryLayers.tableName]: 'DifferentTable',
  [fieldNames.queryLayers.layerName]: 'Different Name',
};
const queryLayerResult4 = {
  ...queryLayerResult,
  [fieldNames.queryLayers.tableName]: 'AnotherTable',
  [fieldNames.queryLayers.layerName]:
    'Different Name Wrap a wrappity wrap wrap',
};

const layers = [
  queryLayerResult,
  queryLayerResult2,
  queryLayerResult3,
  queryLayerResult4,
];

export const Pending = () => {
  return <DownloadProgress layers={layers} url={null} />;
};

export const Success = () => {
  return <DownloadProgress layers={layers} url="https://google.com" />;
};

export const ErrorMessage = () => {
  return (
    <DownloadProgress
      layers={layers}
      url={null}
      error={new Error('test error message')}
    />
  );
};
