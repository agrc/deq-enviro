import { buffer } from '@arcgis/core/geometry/geometryEngine';
import { isLoaded, load, project } from '@arcgis/core/geometry/projection';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Input from '../../../utah-design-system/Input';

export default function Buffer({ className, onChange, inputGeometry }) {
  const [bufferMiles, setBufferMiles] = useState(0.1);

  useEffect(() => {
    const giddyUp = async () => {
      if (inputGeometry) {
        let geometry = inputGeometry.clone();
        if (geometry.spatialReference.wkid === 4326) {
          if (!isLoaded()) {
            await load();
          }
          geometry = await project(geometry, { wkid: 26912 });
        }
        onChange(buffer(geometry, bufferMiles, 'miles'));
      } else {
        onChange(null);
      }
    };
    giddyUp();
  }, [bufferMiles, inputGeometry, onChange]);

  const invalidBuffer = bufferMiles < 0.1;

  return (
    <Input
      className={className}
      label="Buffer (miles, min: 0.1)"
      value={bufferMiles}
      onChange={setBufferMiles}
      invalid={invalidBuffer}
      message={invalidBuffer ? 'Buffer must be at least 0.1 miles.' : null}
      type="number"
    />
  );
}

Buffer.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  inputGeometry: PropTypes.object,
};
