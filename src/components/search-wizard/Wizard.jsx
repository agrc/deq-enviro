import { useMachine } from '@xstate/react';
import { useEffect, useState } from 'react';
import { useRemoteConfigString } from 'reactfire';
import { fieldNames, schemas } from '../../config.js';
import searchMachine from '../../searchMachine.js';
import Button from '../../utah-design-system/Button.jsx';
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
    <div className="flex h-full flex-col">
      {state.matches('queryLayers') ? (
        <SelectMapData
          queryLayers={queryLayers}
          machineState={state}
          machineSend={send}
        />
      ) : null}
      {state.matches('advanced') ? <AdvancedFilter /> : null}
      <div className="justify-self-end border-t border-t-slate-300 p-2">
        <Button
          appearance={Button.Appearances.solid}
          color={Button.Colors.primary}
          className="w-full"
          size={Button.Sizes.xl}
          // onClick={() => send('SEARCH')}
          onClick={console.log}
        >
          Search
        </Button>
        <Button
          color={Button.Colors.accent}
          className="mt-2 w-full"
          size={Button.Sizes.xl}
          // onClick={() => send('SEARCH')}
          onClick={console.log}
        >
          Clear
        </Button>
      </div>
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
