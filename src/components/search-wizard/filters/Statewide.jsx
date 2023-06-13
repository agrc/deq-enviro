import PropTypes from 'prop-types';
import { useEffect } from 'react';
import stateOfUtahJson from '../../../data/state-of-utah.json';

export default function Statewide({ send }) {
  useEffect(() => {
    send('SET_FILTER', {
      filter: { geometry: stateOfUtahJson, name: 'State of Utah' },
    });
  }, [send]);

  return null;
}

Statewide.propTypes = {
  send: PropTypes.func.isRequired,
};
