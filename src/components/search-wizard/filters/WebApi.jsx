import PropTypes from 'prop-types';
import { useCallback, useEffect } from 'react';
import WebApiSearch from './WebApiSearch';

export default function WebApiFilter({
  contextField,
  layer,
  name,
  searchField,
  send,
}) {
  const onChange = useCallback(
    (geometry, name) => {
      send('SET_FILTER', {
        filter: {
          geometry,
          name,
        },
      });
    },
    [send]
  );

  useEffect(() => {
    send('SET_FILTER', {
      filter: {
        geometry: null,
        name: null,
      },
    });
  }, [send, layer]);

  return (
    <WebApiSearch
      layer={layer}
      searchField={searchField}
      name={name}
      contextField={contextField}
      onChange={onChange}
    />
  );
}

WebApiFilter.propTypes = {
  contextField: PropTypes.string,
  layer: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  searchField: PropTypes.string.isRequired,
  send: PropTypes.func.isRequired,
};
