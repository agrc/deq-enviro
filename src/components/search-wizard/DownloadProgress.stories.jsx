import { fieldNames } from '../../../functions/common/config';
import queryLayerResult from '../../../tests/fixtures/queryLayerResult.json';
import DownloadProgress from './DownloadProgress';

export default {
  title: 'DownloadProgress',
  component: DownloadProgress,
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

export const Default = () => {
  const results = [
    {
      tableName: 'SomeOtherTable',
      error: 'There was an error!',
    },
    {
      tableName: 'DifferentTable',
      url: 'https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/SITEREM/FeatureServer/replicafilescache/SITEREM_-1519884480040818284.zip',
      features: [{}, {}],
    },
    {
      tableName: 'AnotherTable',
      url: 'https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/SITEREM/FeatureServer/replicafilescache/SITEREM_-1519884480040818284.zip',
    },
  ];

  return <DownloadProgress layers={layers} results={results} />;
};
