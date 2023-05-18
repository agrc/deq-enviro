import { fieldNames } from '../../functions/common/config';
import { useSearchMachine } from '../SearchMachineProvider';
import ResultTable from './ResultTable';

export default function ResultsPanel() {
  const [state] = useSearchMachine();

  if (!state.matches('result')) {
    return null;
  }

  return (
    <div className="relative h-80 w-full border-t border-slate-300">
      {state.context.resultLayers.map((queryLayerResult) => (
        <ResultTable
          key={queryLayerResult[fieldNames.queryLayers.uniqueId]}
          queryLayerResult={queryLayerResult}
        />
      ))}
    </div>
  );
}
