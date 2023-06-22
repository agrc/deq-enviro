import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Sherlock from '../../../utah-design-system/Sherlock';
import Buffer from './Buffer';
import NHDProvider from './NHDProvider';

export default function NHDStream({ send }) {
  const [stream, setStream] = useState(null);
  const [bufferGeometry, setBufferGeometry] = useState(null);
  const [sherlockConfig, setSherlockConfig] = useState(null);

  useEffect(() => {
    setSherlockConfig({
      provider: new NHDProvider(),
      placeHolder: 'start typing a stream name...',
      onSherlockMatch: (features) => {
        const feature = features[0];
        setStream({
          geometry: feature.geometry,
          name: feature.attributes.gnis_name,
        });
      },
      maxResultsToDisplay: 15,
    });
  }, [setSherlockConfig]);

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

  return (
    <>
      <Buffer onChange={setBufferGeometry} inputGeometry={stream?.geometry} />
      {sherlockConfig && <Sherlock {...sherlockConfig} />}
    </>
  );
}

NHDStream.propTypes = {
  send: PropTypes.func.isRequired,
};
