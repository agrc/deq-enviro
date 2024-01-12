import { Suspense, createRef, lazy, useEffect, useState } from 'react';
import { useSearchMachine } from '../contexts/SearchMachineProvider';
import useMap from '../contexts/useMap';
import Spinner from '../utah-design-system/Spinner.jsx';
import PanelResizer from './PanelResizer';
import clsx from 'clsx';

const ResultTable = lazy(() => import('./ResultTable.jsx'));

export default function ResultsPanel() {
  const [state] = useSearchMachine();
  const [expandedTableName, setExpandedTableName] = useState(null);

  const { selectedGraphicInfo } = useMap();

  useEffect(() => {
    if (selectedGraphicInfo) {
      setExpandedTableName(selectedGraphicInfo.layerId);
    }
  }, [
    selectedGraphicInfo,
    state.context.resultLayers,
    state.context.searchLayerTableNames,
  ]);

  const originalHeight = 256;
  const [height, setHeight] = useState(originalHeight);

  const containerRef = createRef();

  const hasExpandedTable = expandedTableName !== null;

  useEffect(() => {
    if (containerRef.current && hasExpandedTable) {
      containerRef.current.scrollTop = 0;
    }
  }, [containerRef, hasExpandedTable]);

  if (!state.matches('result')) {
    return null;
  }

  return (
    <>
      <PanelResizer
        show={state.matches('result')}
        onResize={(dragValue) => {
          setHeight(originalHeight - dragValue);
        }}
        initialHeight={originalHeight}
      />
      <div
        className={clsx(
          !hasExpandedTable && 'overflow-y-auto',
          'relative w-full border-t border-slate-300',
        )}
        style={{
          height: `${height}px`,
        }}
        ref={containerRef}
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
          {hasExpandedTable ? (
            <ResultTable
              key={expandedTableName}
              queryLayerResult={state.context.resultLayers[expandedTableName]}
              expanded
              setExpandedTableName={setExpandedTableName}
            />
          ) : (
            state.context.searchLayerTableNames.map((tableName) => {
              const queryLayerResult = state.context.resultLayers[tableName];

              return (
                <ResultTable
                  key={tableName}
                  queryLayerResult={queryLayerResult}
                  expanded={false}
                  setExpandedTableName={setExpandedTableName}
                />
              );
            })
          )}
        </Suspense>
      </div>
    </>
  );
}
