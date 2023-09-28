import SearchProgress from './SearchProgress';

export default {
  title: 'SearchProgress',
  component: SearchProgress,
};

const queryLayers = [
  {
    'Unique ID': '0',
    'Layer Name': 'Public Water System Facilities',
  },
  {
    'Unique ID': '3',
    'Layer Name': 'Public Water Error',
  },
  {
    'Unique ID': '4',
    'Layer Name': 'Public Water Still Searching',
  },
  {
    'Unique ID': '5',
    'Layer Name': 'Public Water Still Searching With a Longer Name',
  },
];

const results = [
  {
    'Unique ID': '0',
    features: new Array(1134),
  },
  {
    'Unique ID': '3',
    error: 'there was an error',
  },
];

export const Default = () => (
  <div className="w-80">
    <SearchProgress
      searchLayerIds={['0', '3', '4', '5']}
      // @ts-ignore
      queryLayers={queryLayers}
      results={results}
      filterName="filter name that wraps and wraps and wraps longer"
    />
  </div>
);
