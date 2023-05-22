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
const results = [
  queryLayerResult,
  queryLayerResult2,
  queryLayerResult3,
  errorResult,
  noneFoundResult,
];

export const Initial = () => {
  const mutation = {
    isLoading: false,
    isError: false,
    isSuccess: false,
  };

  return <Download searchResultLayers={results} mutation={mutation} />;
};

export const Busy = () => {
  const mutation = {
    isLoading: true,
    isError: false,
    isSuccess: false,
  };

  return <Download searchResultLayers={results} mutation={mutation} />;
};

export const Result = () => {
  const mutation = {
    isLoading: false,
    isError: false,
    isSuccess: true,
    data: {
      url: 'https://example.com',
    },
  };

  return <Download searchResultLayers={results} mutation={mutation} />;
};

export const Error = () => {
  const mutation = {
    isLoading: false,
    isError: true,
    isSuccess: false,
    error: {
      message: 'There was an error generating the zip file',
    },
  };

  return <Download searchResultLayers={results} mutation={mutation} />;
};
