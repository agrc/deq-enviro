import { useMachine } from '@xstate/react';
import PropTypes from 'prop-types';
import searchMachine from '../../searchMachine.js';
import AdvancedFilter from './AdvancedFilter.jsx';
import SelectMapData from './SelectMapData.jsx';

export default function SearchWizard({ queryLayers }) {
  const [state, send] = useMachine(searchMachine);

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
