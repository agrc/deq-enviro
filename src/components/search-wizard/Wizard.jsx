import { useMachine } from '@xstate/react';
import { useRemoteConfigString } from 'reactfire';
import searchMachine from '../../searchMachine.js';
import AdvancedFilter from './AdvancedFilter.jsx';
import SelectMapData from './SelectMapData.jsx';

export default function SearchWizard() {
  const [state, send] = useMachine(searchMachine);
  // todo - use logEvent from 'firebase/analytics' to log which layers are selected

  const queryLayersConfig = useRemoteConfigString('queryLayers');
  if (queryLayersConfig.status === 'loading') {
    return null;
  }

  const queryLayers = JSON.parse(queryLayersConfig.data);

  return (
    <div className="p-2">
      {state.matches('queryLayers') ? (
        <SelectMapData
          queryLayers={queryLayers}
          machineState={state}
          machineSend={send}
        />
      ) : null}
      {state.matches('advanced') ? <AdvancedFilter /> : null}
      Selected query layer ids:{' '}
      {JSON.stringify(state.context.queryLayers.map((config) => config.id))}
    </div>
  );
}

// What will the params to the search function look like?
// search({
//   queryLayers: [
//     {
//       index: 0,
//       filter: {} || null
//     }
//   ],
//   advanced: {...}
// })
