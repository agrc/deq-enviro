import { Suspense, lazy } from 'react';
import { fieldNames } from '../../functions/common/config';
import { useSearchMachine } from '../SearchMachineProvider';
import Spinner from '../utah-design-system/Spinner.jsx';

const ResultTable = lazy(() => import('./ResultTable.jsx'));

export default function ResultsPanel() {
  const [state] = useSearchMachine();

  if (!state.matches('result')) {
    return null;
  }

  return (
    <div className="relative h-80 w-full border-t border-slate-300">
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <Spinner className="h-10 w-10" size={Spinner.Sizes.custom} />
          </div>
        }
      >
        {state.context.resultLayers.map((queryLayerResult) => (
          <ResultTable
            key={queryLayerResult[fieldNames.queryLayers.uniqueId]}
            queryLayerResult={queryLayerResult}
          />
        ))}
      </Suspense>
    </div>
  );
}
