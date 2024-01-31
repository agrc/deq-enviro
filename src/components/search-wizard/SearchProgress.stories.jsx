import SearchProgress from './SearchProgress';

export default {
  title: 'SearchProgress',
  component: SearchProgress,
};

const queryLayers = [
  {
    'Table Name': 'TableName',
    'Layer Name': 'Public Water System Facilities',
  },
  {
    'Table Name': 'AnotherTable',
    'Layer Name': 'Public Water Error',
  },
  {
    'Table Name': 'TableNext',
    'Layer Name': 'Public Water Still Searching',
  },
  {
    'Table Name': 'HelloTable',
    'Layer Name': 'Public Water Still Searching With a Longer Name',
  },
];

const results = {
  TableName: {
    'Table Name': 'TableName',
    features: new Array(1134),
  },
  AnotherTable: {
    'Table Name': 'AnotherTable',
    error: 'there was an error',
  },
};

export const Default = () => (
  <div className="w-80">
    <SearchProgress
      searchLayerTableNames={[
        'TableName',
        'AnotherTable',
        'TableNext',
        'HelloTable',
      ]}
      // @ts-ignore
      queryLayers={queryLayers}
      // @ts-ignore
      results={results}
      filterName="filter name that wraps and wraps and wraps longer"
      layerFilterValues={{
        TableName: [
          {
            type: 'field',
            field: 'FieldName',
            fieldType: 'text',
            values: ['value1', 'value2', 'value3'],
          },
        ],
        TableNext: [
          {
            type: 'checkbox',
            values: ['value1', 'value2', 'value3'],
          },
        ],
      }}
    />
  </div>
);
