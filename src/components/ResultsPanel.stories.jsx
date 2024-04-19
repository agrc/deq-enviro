import { fieldNames } from '../../functions/common/config';
import queryLayerResult from '../../tests/fixtures/queryLayerResult.json';
import { SearchMachineContext } from '../contexts/SearchMachineProvider';
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
      resultLayers: {
        Brownfields: queryLayerResult,
        TableName: queryLayerResult2,
        SomeTable: errorResult,
        ATable: queryLayerResult3,
        HelloTable: noneFoundResult,
        TableName2: {
          ...queryLayerResult2,
          [fieldNames.queryLayers.tableName]: 'TableName2',
        },
        AnotherTable: {
          ...queryLayerResult2,
          [fieldNames.queryLayers.tableName]: 'AnotherTable',
        },
        SomeTable2: {
          ...queryLayerResult2,
          [fieldNames.queryLayers.tableName]: 'SomeTable2',
        },
        TheTable: {
          ...queryLayerResult2,
          [fieldNames.queryLayers.tableName]: 'TheTable',
        },
        NewTable: {
          ...queryLayerResult2,
          [fieldNames.queryLayers.tableName]: 'NewTable',
        },
        OldTable: {
          ...queryLayerResult2,
          [fieldNames.queryLayers.tableName]: 'OldTable',
        },
      },
      searchLayerTableNames: [
        'Brownfields',
        'TableName',
        'SomeTable',
        'ATable',
        'HelloTable',
        'TableName2',
        'AnotherTable',
        'SomeTable2',
        'TheTable',
        'NewTable',
        'OldTable',
      ],
    },
    matches: () => true,
  };

  return (
    <div className="absolute h-3/4 w-full">
      <div className="relative h-full w-full">
        <div className="h-1/2 w-full"></div>
        <MapProvider>
          <SearchMachineContext.Provider value={[state]}>
            <ResultsPanel />
          </SearchMachineContext.Provider>
        </MapProvider>
      </div>
    </div>
  );
};
