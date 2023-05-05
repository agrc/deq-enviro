import { useMachine } from '@xstate/react';
import { useEffect, useState } from 'react';
import { useRemoteConfigString } from 'reactfire';
import { fieldNames, schemas } from '../../config.js';
import searchMachine from '../../searchMachine.js';
import AdvancedFilter from './AdvancedFilter.jsx';
import SelectMapData from './SelectMapData.jsx';

export default function SearchWizard() {
  const [state, send] = useMachine(searchMachine);
  const [queryLayers, setQueryLayers] = useState([]);
  // todo - use logEvent from 'firebase/analytics' to log which layers are selected

  const queryLayersConfig = useRemoteConfigString('queryLayers');
  useEffect(() => {
    if (queryLayersConfig.status === 'success') {
      console.log('validating query layer configs');
      const validatedQueryLayers = JSON.parse(queryLayersConfig.data).filter(
        (config) => {
          try {
            schemas.queryLayers.validateSync(config);
            return true;
          } catch (error) {
            console.error(
              `Invalid Query Layer config for ${
                config[fieldNames.queryLayers.layerName]
              }: \n${error.message} \n${JSON.stringify(config, null, 2)})}`
            );
            return false;
          }
        }
      );
      setQueryLayers(validatedQueryLayers);
    }
  }, [queryLayersConfig]);

  if (queryLayersConfig.status === 'loading') {
    return null;
  }

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
