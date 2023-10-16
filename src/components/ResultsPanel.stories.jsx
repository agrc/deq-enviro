import { fieldNames } from '../../functions/common/config';
import queryLayerResult from '../../tests/fixtures/queryLayerResult.json';
import { SearchMachineContext } from '../SearchMachineProvider';
import MapProvider from '../contexts/MapProvider';
import ResultsPanel from './ResultsPanel';

export default {
  title: 'ResultsPanel',
  component: ResultsPanel,
};

export const Default = () => {
  const queryLayerResult2 = {
    ...queryLayerResult,
    [fieldNames.queryLayers.tableName]: 'TableName',
    [fieldNames.queryLayers.layerName]: 'A longer name than most',
  };
  const queryLayerResult3 = {
    ...queryLayerResult,
    [fieldNames.queryLayers.tableName]: 'ATable',
  };
  const errorResult = {
    ...queryLayerResult,
    [fieldNames.queryLayers.tableName]: 'SomeTable',
    error: 'There was an error',
  };
  const noneFoundResult = {
    ...queryLayerResult,
    [fieldNames.queryLayers.tableName]: 'HelloTable',
    features: [],
  };
  const state = {
    context: {
      resultLayers: [
        queryLayerResult,
        queryLayerResult2,
        errorResult,
        queryLayerResult3,
        noneFoundResult,
        {
          ...queryLayerResult2,
          [fieldNames.queryLayers.tableName]: 'TableName',
        },
        {
          ...queryLayerResult2,
          [fieldNames.queryLayers.tableName]: 'AnotherTable',
        },
        {
          ...queryLayerResult2,
          [fieldNames.queryLayers.tableName]: 'SomeTable',
        },
        {
          ...queryLayerResult2,
          [fieldNames.queryLayers.tableName]: 'TheTable',
        },
        {
          ...queryLayerResult2,
          [fieldNames.queryLayers.tableName]: 'NewTable',
        },
        {
          ...queryLayerResult2,
          [fieldNames.queryLayers.tableName]: 'OldTable',
        },
      ],
    },
    matches: () => true,
  };

  return (
    <div className="border border-slate-300">
      <MapProvider>
        <SearchMachineContext.Provider value={[state]}>
          <ResultsPanel />
        </SearchMachineContext.Provider>
      </MapProvider>
    </div>
  );
};
