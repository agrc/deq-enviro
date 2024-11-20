import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import appConfig from '../../../app-config.js';
import Sherlock, {
  LocatorSuggestProvider,
} from '../../../utah-design-system/Sherlock.jsx';
import Buffer from './Buffer';

export default function StreetAddress({ send }) {
  const [sherlockConfig, setSherlockConfig] = useState(null);
  const [address, setAddress] = useState(null);
  const [bufferGeometry, setBufferGeometry] = useState(null);

  useEffect(() => {
    const filter =
      bufferGeometry && address
        ? {
            geometry: bufferGeometry,
            name: `Street Address: ${address?.attributes?.Match_addr}`,
          }
        : {
            geometry: null,
            name: null,
          };
    send({ type: 'SET_FILTER', filter });
  }, [address, bufferGeometry, send]);

  useEffect(() => {
    const provider = new LocatorSuggestProvider(
      appConfig.urls.masquerade,
      3857,
    );
    setSherlockConfig({
      placeHolder: 'street address, city or zip',
      onSherlockMatch: (features) => setAddress(features[0]),
      provider,
      maxResultsToDisplay: 10,
    });
  }, [setSherlockConfig]);

  return (
    <>
      <Buffer onChange={setBufferGeometry} inputGeometry={address?.geometry} />
      {sherlockConfig && <Sherlock {...sherlockConfig} />}
      {/* buffer to make sure user can scroll far enough to see the entire select filter type dropdown */}
      <div className="h-28" />
    </>
  );
}

StreetAddress.propTypes = {
  send: PropTypes.func.isRequired,
};
