import { Point } from '@arcgis/core/geometry';
import { set } from 'lodash';
import { useEffect, useState } from 'react';
import { useImmerReducer } from 'use-immer';
import Select from '../../../utah-design-system/Select';
import Buffer from './Buffer';
import RangeValidationInput from './RangeValidationInput';

/**
 * @param {Object} props
 * @param {function} props.send
 * @returns {JSX.Element}
 */
export default function Coordinates({ send }) {
  const coordinateTypes = {
    utm: {
      label: 'UTM',
    },
    decimalDegrees: {
      label: 'Decimal Degrees',
    },
    degreesMinutesSeconds: {
      label: 'Degrees Minutes Seconds',
    },
  };

  const [coordinateType, setCoordinateType] = useState('utm');
  const [x, setX] = useState(null);
  const [y, setY] = useState(null);
  const [bufferGeometry, setBufferGeometry] = useState(null);

  const onCoordinateTypeChange = (newValue) => {
    setX(null);
    setY(null);
    setBufferGeometry(null);

    setCoordinateType(newValue);
  };

  useEffect(() => {
    const filter =
      bufferGeometry && x && y
        ? {
            geometry: bufferGeometry,
            name: `Coordinates: ${x}, ${y}`,
          }
        : {
            geometry: null,
            name: null,
          };
    send({ type: 'SET_FILTER', filter });
  }, [bufferGeometry, send, x, y]);

  const onDegreeMinutesChange = (newPoint) => {
    setX(newPoint?.x);
    setY(newPoint?.y);
  };

  const getInputs = (type) => {
    switch (type) {
      case 'utm':
        return (
          <div key="utm">
            <RangeValidationInput
              className="mt-2"
              label="Easting"
              max={700_000}
              min={200_000}
              onChange={setX}
              required
              suffix="m"
              type="number"
              value={x}
            />
            <RangeValidationInput
              className="mt-2"
              label="Northing"
              max={4_700_000}
              min={4_060_000}
              onChange={setY}
              required
              suffix="m"
              type="number"
              value={y}
            />
          </div>
        );

      case 'decimalDegrees':
        return (
          <div key="dd">
            <RangeValidationInput
              className="mt-2"
              label="Longitude"
              max={114.25}
              min={108.7}
              onChange={(newValue) => setX(-newValue)}
              prefix="-"
              required
              suffix="°"
              type="number"
              value={-x}
            />
            <RangeValidationInput
              className="mt-2"
              label="Latitude"
              min={36.7}
              max={42.18}
              onChange={setY}
              required
              suffix="°"
              type="number"
              value={y}
            />
          </div>
        );

      case 'degreesMinutesSeconds':
        return <DegreesMinutesSeconds onChange={onDegreeMinutesChange} />;

      default:
        throw new Error(`Unknown coordinate type: ${type}`);
    }
  };

  const [inputGeometry, setInputGeometry] = useState(null);
  useEffect(() => {
    if (x && y) {
      setInputGeometry(
        new Point({
          x,
          y,
          spatialReference: {
            wkid: coordinateType === 'utm' ? 26912 : 4326,
          },
        }),
      );
    } else {
      setInputGeometry(null);
    }
  }, [coordinateType, x, y]);

  return (
    <div>
      <strong>Coordinate System</strong>
      <Select
        items={Object.keys(coordinateTypes).map((key) => ({
          value: key,
          label: coordinateTypes[key].label,
        }))}
        onValueChange={onCoordinateTypeChange}
        value={coordinateType}
      />
      {getInputs(coordinateType)}
      <Buffer
        className="mt-2"
        onChange={setBufferGeometry}
        inputGeometry={inputGeometry}
      />
    </div>
  );
}

function reducer(draft, action) {
  set(draft, action.meta, action.value);
  if (draft.longitude.degrees && draft.latitude.degrees) {
    let x = -Number(draft.longitude.degrees);
    if (draft.longitude.minutes) x -= Number(draft.longitude.minutes) / 60;
    if (draft.longitude.seconds) x -= Number(draft.longitude.seconds) / 3600;

    let y = Number(draft.latitude.degrees);
    if (draft.latitude.minutes) y += Number(draft.latitude.minutes) / 60;
    if (draft.latitude.seconds) y += Number(draft.latitude.seconds) / 3600;

    draft.point = { x, y };
  } else {
    draft.point = null;
  }
}

/**
 * @param {Object} props
 * @param {function} props.onChange
 * @returns {JSX.Element}
 */
function DegreesMinutesSeconds({ onChange }) {
  const [state, dispatch] = useImmerReducer(reducer, {
    point: null,
    longitude: {
      degrees: null,
      minutes: null,
      seconds: null,
    },
    latitude: {
      degrees: null,
      minutes: null,
      seconds: null,
    },
  });

  useEffect(() => {
    onChange(state.point);
  }, [onChange, state.point]);

  return (
    <>
      <h4 className="mt-2">Longitude</h4>
      <RangeValidationInput
        className="mt-2"
        label="Degrees"
        min={108.7}
        max={114.25}
        onChange={(newValue) =>
          dispatch({ meta: 'longitude.degrees', value: newValue })
        }
        prefix="-"
        required
        suffix="°"
        type="number"
        value={state.longitude.degrees}
      />
      <RangeValidationInput
        className="mt-2"
        label="Minutes (optional)"
        min={0}
        max={60}
        onChange={(newValue) =>
          dispatch({ meta: 'longitude.minutes', value: newValue })
        }
        suffix="'"
        type="number"
        value={state.longitude.minutes}
      />
      <RangeValidationInput
        className="mt-2"
        label="Seconds (optional)"
        min={0}
        max={60}
        onChange={(newValue) =>
          dispatch({ meta: 'longitude.seconds', value: newValue })
        }
        suffix='"'
        type="number"
        value={state.longitude.seconds}
      />

      <h4 className="mt-2">Latitude</h4>
      <RangeValidationInput
        className="mt-2"
        label="Degrees"
        min={36.7}
        max={42.18}
        onChange={(newValue) =>
          dispatch({ meta: 'latitude.degrees', value: newValue })
        }
        required
        suffix="°"
        type="number"
        value={state.latitude.degrees}
      />
      <RangeValidationInput
        className="mt-2"
        label="Minutes (optional)"
        min={0}
        max={60}
        onChange={(newValue) =>
          dispatch({ meta: 'latitude.minutes', value: newValue })
        }
        type="number"
        suffix="'"
        value={state.latitude.minutes}
      />
      <RangeValidationInput
        className="mt-2"
        label="Seconds (optional)"
        min={0}
        max={60}
        onChange={(newValue) =>
          dispatch({ meta: 'latitude.seconds', value: newValue })
        }
        suffix='"'
        type="number"
        value={state.latitude.seconds}
      />
    </>
  );
}
