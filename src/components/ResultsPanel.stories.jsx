import { fieldNames } from '../../functions/common/config';
import queryLayerResult from '../../tests/fixtures/queryLayerResult.json';
import { SearchMachineContext } from '../SearchMachineProvider';
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
      ],
    },
    matches: () => true,
  };

  return (
    <div className="border border-slate-300">
      <SearchMachineContext.Provider value={[state]}>
        <ResultsPanel />
      </SearchMachineContext.Provider>
    </div>
  );
};
