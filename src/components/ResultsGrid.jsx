import { useSearchMachine } from '../SearchMachineProvider';

export default function ResultsGrid() {
  const [state] = useSearchMachine();

  if (!state.matches('result')) {
    return null;
  }

  return (
    <div className="h-80 w-full border-t border-slate-300">
      {state.context.resultLayers.map((queryLayerResult) => (
        <div key={queryLayerResult.id}>
          {queryLayerResult.error ? (
            <div className="text-red-500">{queryLayerResult.error}</div>
          ) : null}
          {queryLayerResult.features?.map((feature, index) => (
            // TODO: handle no features found
            <span key={index}>
              {JSON.stringify(feature.attributes, null, 2)}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
