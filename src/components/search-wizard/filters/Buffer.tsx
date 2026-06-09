import Geometry from '@arcgis/core/geometry/Geometry';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import * as geodesicBufferOperator from '@arcgis/core/geometry/operators/geodesicBufferOperator';
import * as projectOperator from '@arcgis/core/geometry/operators/projectOperator';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Input from '../../../utah-design-system/Input';

const wgs84 = new SpatialReference({ wkid: 4326 });

type BufferProps = {
  className?: string;
  onChange: (value: Geometry | null) => void;
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
          if (geometry.spatialReference.wkid !== 4326) {
            if (!projectOperator.isLoaded()) {
              await projectOperator.load();
            }
            geometry = projectOperator.execute(geometry, wgs84) as Geometry;
          }
          if (!geodesicBufferOperator.isLoaded()) {
            await geodesicBufferOperator.load();
          }
          onChange(
            geodesicBufferOperator.execute(geometry, bufferMiles, {
              unit: 'miles',
            }) as Geometry,
          );
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
