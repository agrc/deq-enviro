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
      send({
        type: 'SET_FILTER',
        filter: {
          geometry,
          name,
        },
      });
    },
    [send],
  );

  useEffect(() => {
    send({
      type: 'SET_FILTER',
      filter: {
        geometry: null,
        name: null,
      },
    });
  }, [send, layer]);

  return (
    <>
      <WebApiSearch
        layer={layer}
        searchField={searchField}
        name={name}
        contextField={contextField}
        onChange={onChange}
      />
      {/* buffer to make sure user can scroll far enough to see the entire select filter type dropdown */}
      <div className="h-40" />{' '}
    </>
  );
}

WebApiFilter.propTypes = {
  contextField: PropTypes.string,
  layer: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  searchField: PropTypes.string.isRequired,
  send: PropTypes.func.isRequired,
};
