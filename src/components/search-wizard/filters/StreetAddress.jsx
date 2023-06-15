import { buffer } from '@arcgis/core/geometry/geometryEngine';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import appConfig from '../../../app-config.js';
import Input from '../../../utah-design-system/Input.jsx';
import Sherlock, {
  LocatorSuggestProvider,
} from '../../../utah-design-system/Sherlock.jsx';

export default function StreetAddress({ send }) {
  const [sherlockConfig, setSherlockConfig] = useState(null);
  const [address, setAddress] = useState(null);
  const [bufferMiles, setBufferMiles] = useState(0.1);
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
    send('SET_FILTER', {
      filter,
    });
  }, [address, bufferGeometry, send]);

  useEffect(() => {
    if (address?.geometry) {
      console.log('buffering');
      setBufferGeometry(buffer(address.geometry, bufferMiles, 'miles'));
    } else {
      setBufferGeometry(null);
    }
  }, [address, bufferMiles]);

  useEffect(() => {
    const provider = new LocatorSuggestProvider(
      appConfig.urls.masquerade,
      3857
    );
    setSherlockConfig({
      placeHolder: 'search by street address...',
      onSherlockMatch: setAddress,
      provider,
      maxResultsToDisplay: 10,
    });
  }, [setSherlockConfig]);

  const invalidBuffer = bufferMiles < 0.1;

  return (
    <>
      <Input
        label="Buffer (miles, min: 0.1)"
        value={bufferMiles}
        onChange={setBufferMiles}
        invalid={invalidBuffer}
        message={invalidBuffer ? 'Buffer must be at least 0.1 miles.' : null}
        type="number"
      />
      {sherlockConfig && <Sherlock {...sherlockConfig} className="mt-2" />}
    </>
  );
}

StreetAddress.propTypes = {
  send: PropTypes.func.isRequired,
};
