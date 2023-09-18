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
    [fieldNames.queryLayers.uniqueId]: '2',
    [fieldNames.queryLayers.layerName]: 'A longer name than most',
  };
  const queryLayerResult3 = {
    ...queryLayerResult,
    [fieldNames.queryLayers.uniqueId]: '3',
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
          [fieldNames.queryLayers.uniqueId]: '6',
        },
        {
          ...queryLayerResult2,
          [fieldNames.queryLayers.uniqueId]: '7',
        },
        {
          ...queryLayerResult2,
          [fieldNames.queryLayers.uniqueId]: '8',
        },
        {
          ...queryLayerResult2,
          [fieldNames.queryLayers.uniqueId]: '9',
        },
        {
          ...queryLayerResult2,
          [fieldNames.queryLayers.uniqueId]: '10',
        },
        {
          ...queryLayerResult2,
          [fieldNames.queryLayers.uniqueId]: '11',
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
