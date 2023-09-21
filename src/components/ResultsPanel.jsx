import clsx from 'clsx';
import { Suspense, lazy, useEffect, useState } from 'react';
import { fieldNames } from '../../functions/common/config';
import { useSearchMachine } from '../SearchMachineProvider';
import useMap from '../contexts/useMap';
import Spinner from '../utah-design-system/Spinner.jsx';
import PanelResizer from './PanelResizer';

const ResultTable = lazy(() => import('./ResultTable.jsx'));

export default function ResultsPanel() {
  const [state] = useSearchMachine();
  const [expandedTableIndex, setExpandedTableIndex] = useState(null);

  const { selectedGraphicInfo } = useMap();

  useEffect(() => {
    if (selectedGraphicInfo) {
      setExpandedTableIndex(
        state.context.resultLayers.indexOf(
          state.context.resultLayers.find(
            (queryLayerResult) =>
              queryLayerResult[fieldNames.queryLayers.uniqueId] ===
              selectedGraphicInfo.layerId,
          ),
        ),
      );
    }
  }, [selectedGraphicInfo, state.context.resultLayers]);

  const originalHeight = 256;
  const [height, setHeight] = useState(originalHeight);

  if (!state.matches('result')) {
    return null;
  }

  return (
    <>
      <PanelResizer
        show={state.matches('result')}
        onResize={(dragValue) => setHeight(originalHeight - dragValue)}
        initialHeight={originalHeight}
      />
      <div
        className={clsx(
          'relative w-full border-t border-slate-300',
          !expandedTableIndex && 'overflow-y-auto',
        )}
        style={{
          height: `${height}px`,
        }}
      >
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <Spinner
                className="h-10 w-10"
                size="custom"
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
    </>
  );
}
