import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import Buffer from './Buffer';
import WebApiSearch from './WebApiSearch';

export default function NHDStream({ send }) {
  const [stream, setStream] = useState(null);
  const [bufferGeometry, setBufferGeometry] = useState(null);

  useEffect(() => {
    const filter =
      bufferGeometry && stream
        ? {
            geometry: bufferGeometry,
            name: stream.name,
          }
        : {
            geometry: null,
            name: null,
          };
    send('SET_FILTER', {
      filter,
    });
  }, [stream, bufferGeometry, send]);

  const onStreamChange = useCallback(
    (geometry, name) => setStream({ geometry, name }),
    []
  );

  return (
    <>
      <Buffer onChange={setBufferGeometry} inputGeometry={stream?.geometry} />
      <WebApiSearch
        layer="water.streams_nhd"
        searchField="gnis_name"
        name="NHD Stream"
        onChange={onStreamChange}
      />
    </>
  );
}

NHDStream.propTypes = {
  send: PropTypes.func.isRequired,
};
