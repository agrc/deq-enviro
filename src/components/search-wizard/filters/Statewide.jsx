import { fromJSON } from '@arcgis/core/geometry/support/jsonUtils';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import stateOfUtahJson from '../../../data/state-of-utah.json';

export default function Statewide({ send }) {
  useEffect(() => {
    send({
      type: 'SET_FILTER',
      filter: { geometry: fromJSON(stateOfUtahJson), name: 'State of Utah' },
    });
  }, [send]);

  // this div is a buffer to make sure that the user can scroll
  // far enough to see the entire select filter type dropdown
  return <div className="h-40" />;
}

Statewide.propTypes = {
  send: PropTypes.func.isRequired,
};
