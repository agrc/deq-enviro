import { useMachine } from '@xstate/react';
import PropTypes from 'prop-types';
import { useRemoteConfigString } from 'reactfire';
import searchMachine from '../../searchMachine.js';
import AdvancedFilter from './AdvancedFilter.jsx';
import SelectMapData from './SelectMapData.jsx';

export default function SearchWizard() {
  const [state, send] = useMachine(searchMachine);

  const queryLayersConfig = useRemoteConfigString('queryLayers');
  if (queryLayersConfig.status === 'loading') {
    console.log('loading remote config');

    return null;
  }

  const queryLayers = JSON.parse(queryLayersConfig.data);

  return (
    <div className="p-2">
      {state.matches('queryLayers') ? (
        <SelectMapData queryLayers={queryLayers} />
      ) : null}
      {state.matches('advanced') ? <AdvancedFilter /> : null}
    </div>
  );
}

SearchWizard.propTypes = {
  queryLayers: PropTypes.array.isRequired,
};
