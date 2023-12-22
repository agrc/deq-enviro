import { fieldNames } from '../../../functions/common/config';
import queryLayerResult from '../../../tests/fixtures/queryLayerResult.json';
import { DownloadProgressInner } from './DownloadProgress';

export default {
  title: 'DownloadProgress',
  component: DownloadProgressInner,
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
  return (
    <DownloadProgressInner
      layers={layers}
      layerResults={{
        Brownfields: {
          processed: false,
          error: null,
        },
        TableName: {
          processed: true,
          error: null,
        },
        DifferentTable: {
          processed: true,
          error: null,
        },
        AnotherTable: {
          processed: false,
          error: null,
        },
      }}
      error={null}
      url={null}
    />
  );
};

export const Success = () => {
  return (
    <DownloadProgressInner
      layers={layers}
      layerResults={{
        Brownfields: {
          processed: true,
          error: null,
        },
        TableName: {
          processed: true,
          error: null,
        },
        DifferentTable: {
          processed: true,
          error: null,
        },
        AnotherTable: {
          processed: true,
          error: null,
        },
      }}
      error={null}
      url="https://example.com/data.zip"
    />
  );
};

export const SuccessWithLayerErrors = () => {
  return (
    <DownloadProgressInner
      layers={layers}
      layerResults={{
        Brownfields: {
          processed: true,
          error: null,
        },
        TableName: {
          processed: true,
          error: null,
        },
        DifferentTable: {
          processed: false,
          error: 'Layer-specific error message',
        },
        AnotherTable: {
          processed: true,
          error: null,
        },
      }}
      error={null}
      url="https://example.com/data.zip"
    />
  );
};
export const ErrorMessage = () => {
  return (
    <DownloadProgressInner
      layers={layers}
      layerResults={{
        Brownfields: {
          processed: false,
          error: 'Layer-specific error message',
        },
        TableName: {
          processed: true,
          error: null,
        },
        DifferentTable: {
          processed: true,
          error: null,
        },
        AnotherTable: {
          processed: false,
          error: null,
        },
      }}
      error="general job error"
      url={null}
    />
  );
};
