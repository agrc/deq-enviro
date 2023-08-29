import { Suspense, lazy, useState } from 'react';
import { fieldNames } from '../../functions/common/config';
import { useSearchMachine } from '../SearchMachineProvider';
import Spinner from '../utah-design-system/Spinner.jsx';
import clsx from 'clsx';

const ResultTable = lazy(() => import('./ResultTable.jsx'));

export default function ResultsPanel() {
  const [state] = useSearchMachine();

  const [expandedTableIndex, setExpandedTableIndex] = useState(null);

  if (!state.matches('result')) {
    return null;
  }

  return (
    <div
      className={clsx(
        'relative h-80 w-full border-t border-slate-300',
        !expandedTableIndex && 'overflow-y-auto',
      )}
    >
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <Spinner
              className="h-10 w-10"
              size={Spinner.Sizes.custom}
              ariaLabel="loading module"
            />
          </div>
        }
      >
        {expandedTableIndex !== null ? (
          <ResultTable
            key={
              state.context.resultLayers[expandedTableIndex][
                fieldNames.queryLayers.uniqueId
              ]
            }
            queryLayerResult={state.context.resultLayers[expandedTableIndex]}
            expanded
            onExpandChange={() => setExpandedTableIndex(null)}
          />
        ) : (
          state.context.resultLayers.map((queryLayerResult, i) => (
            <ResultTable
              key={queryLayerResult[fieldNames.queryLayers.uniqueId]}
              queryLayerResult={queryLayerResult}
              expanded={false}
              onExpandChange={() => setExpandedTableIndex(i)}
            />
          ))
        )}
      </Suspense>
    </div>
  );
}
