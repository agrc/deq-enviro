import { useMachine } from '@xstate/react';
import localforage from 'localforage';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { getDefaultLayerFilterValues } from '../utils';
import { useRemoteConfigValues } from './RemoteConfigProvider';
import { machine } from './SearchMachine';
import { SearchMachineContext } from './SearchMachineContext';

export function SearchMachineProvider({ children }) {
  const [state, send] = useMachine(machine);

  // this get's incremented each time the config spreadsheet is deployed
  const { version, queryLayers } = useRemoteConfigValues();

  useEffect(() => {
    const VERSION_KEY = 'searchContextVersion';
    localforage.getItem(VERSION_KEY).then((cacheVersion) => {
      const defaultLayerFilterValues = getDefaultLayerFilterValues(queryLayers);
      if (cacheVersion !== version) {
        console.warn('new search cache version found, clearing old cache');
        localforage.clear();
        localforage.setItem(VERSION_KEY, version);

        send({
          type: 'CLEAR',
          defaults: { layerFilterValues: defaultLayerFilterValues },
        });
      } else {
        send({
          type: 'APPLY_DEFAULTS',
          defaults: { layerFilterValues: defaultLayerFilterValues },
        });
      }
    });
  }, [queryLayers, send, version]);

  return (
    <SearchMachineContext.Provider value={[state, send]}>
      {children}
    </SearchMachineContext.Provider>
  );
}

SearchMachineProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
