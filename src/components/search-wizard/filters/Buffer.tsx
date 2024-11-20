import { buffer } from '@arcgis/core/geometry/geometryEngine';
import { isLoaded, load, project } from '@arcgis/core/geometry/projection';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Input from '../../../utah-design-system/Input';
import Geometry from '@arcgis/core/geometry/Geometry';

type BufferProps = {
  className?: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: Geometry) => void;
  inputGeometry: Geometry | null;
  allowZero?: boolean;
};
export default function Buffer({
  className,
  onChange,
  inputGeometry,
  allowZero,
}: BufferProps) {
  const [bufferMiles, setBufferMiles] = useState(allowZero ? 0 : 0.1);

  useEffect(() => {
    const giddyUp = async () => {
      if (inputGeometry) {
        let geometry = inputGeometry.clone();
        if (allowZero && bufferMiles === 0) {
          onChange(geometry);
        } else {
          if (geometry.spatialReference.wkid === 4326) {
            if (!isLoaded()) {
              await load();
            }
            geometry = (await project(geometry, { wkid: 26912 })) as Geometry;
          }
          onChange(buffer(geometry, bufferMiles, 'miles') as Geometry);
        }
      } else {
        onChange(null);
      }
    };
    giddyUp();
  }, [allowZero, bufferMiles, inputGeometry, onChange]);

  const invalidBuffer = allowZero ? false : bufferMiles < 0.1;

  return (
    <Input
      className={className}
      label={allowZero ? 'Buffer (miles)' : 'Buffer (miles, min: 0.1)'}
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
