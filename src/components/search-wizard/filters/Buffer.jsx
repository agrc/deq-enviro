import { buffer } from '@arcgis/core/geometry/geometryEngine';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Input from '../../../utah-design-system/Input';

export default function Buffer({ onChange, inputGeometry }) {
  const [bufferMiles, setBufferMiles] = useState(0.1);

  useEffect(() => {
    if (inputGeometry) {
      onChange(buffer(inputGeometry, bufferMiles, 'miles'));
    } else {
      onChange(null);
    }
  }, [bufferMiles, inputGeometry, onChange]);

  const invalidBuffer = bufferMiles < 0.1;

  return (
    <div>
      <Input
        label="Buffer (miles, min: 0.1)"
        value={bufferMiles}
        onChange={setBufferMiles}
        invalid={invalidBuffer}
        message={invalidBuffer ? 'Buffer must be at least 0.1 miles.' : null}
        type="number"
      />
    </div>
  );
}

Buffer.propTypes = {
  onChange: PropTypes.func.isRequired,
  inputGeometry: PropTypes.object,
};
