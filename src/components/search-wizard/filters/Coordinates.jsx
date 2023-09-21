import { Point } from '@arcgis/core/geometry';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Select from '../../../utah-design-system/Select';
import Buffer from './Buffer';
import RangeValidationInput from './RangeValidationInput';

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
  const point = useMemo(() => {
    return {
      x,
      y,
    };
  }, [x, y]);
  const [bufferGeometry, setBufferGeometry] = useState(null);

  useEffect(() => {
    setX(null);
    setY(null);
    setBufferGeometry(null);
  }, [coordinateType]);

  useEffect(() => {
    const filter =
      bufferGeometry && point
        ? {
            geometry: bufferGeometry,
            name: `Coordinates: ${point.x}, ${point.y}`,
          }
        : {
            geometry: null,
            name: null,
          };
    send('SET_FILTER', {
      filter,
    });
  }, [bufferGeometry, point, send]);

  const onDegreeMinutesChange = useCallback((point) => {
    setX(point?.x);
    setY(point?.y);
  }, []);

  const getInputs = (type) => {
    switch (type) {
      case 'utm':
        return (
          <>
            <RangeValidationInput
              className="mt-2"
              label="Easting"
              max={700_000}
              min={200_000}
              onChange={setX}
              required
              type="number"
            />
            <RangeValidationInput
              className="mt-2"
              label="Northing"
              max={4_700_000}
              min={4_060_000}
              onChange={setY}
              required
              type="number"
            />
          </>
        );

      case 'decimalDegrees':
        return (
          <>
            <RangeValidationInput
              className="mt-2"
              label="Longitude"
              min={-114.25}
              max={-108.7}
              onChange={setX}
              required
              type="number"
            />
            <RangeValidationInput
              className="mt-2"
              label="Latitude"
              min={36.7}
              max={42.18}
              onChange={setY}
              required
              type="number"
            />
          </>
        );

      case 'degreesMinutesSeconds':
        return <DegreesMinutesSeconds onChange={onDegreeMinutesChange} />;

      default:
        throw new Error(`Unknown coordinate type: ${type}`);
    }
  };

  const [inputGeometry, setInputGeometry] = useState(null);
  useEffect(() => {
    if (point && point.x && point.y) {
      setInputGeometry(
        new Point({
          x: point.x,
          y: point.y,
          spatialReference: {
            wkid: coordinateType === 'utm' ? 26912 : 4326,
          },
        }),
      );
    } else {
      setInputGeometry(null);
    }
  }, [coordinateType, point]);

  return (
    <div>
      <strong>Coordinate System</strong>
      <Select
        items={Object.keys(coordinateTypes).map((key) => ({
          value: key,
          label: coordinateTypes[key].label,
        }))}
        onValueChange={setCoordinateType}
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

Coordinates.propTypes = {
  send: PropTypes.func.isRequired,
};

function DegreesMinutesSeconds({ onChange }) {
  const [longitudeDegrees, setLongitudeDegrees] = useState(null);
  const [longitudeMinutes, setLongitudeMinutes] = useState(null);
  const [longitudeSeconds, setLongitudeSeconds] = useState(null);
  const [latitudeDegrees, setLatitudeDegrees] = useState(null);
  const [latitudeMinutes, setLatitudeMinutes] = useState(null);
  const [latitudeSeconds, setLatitudeSeconds] = useState(null);

  useEffect(() => {
    if (longitudeDegrees && latitudeDegrees) {
      let x = Number(longitudeDegrees);
      if (longitudeMinutes) x -= Number(longitudeMinutes) / 60;
      if (longitudeSeconds) x -= Number(longitudeSeconds) / 3600;

      let y = Number(latitudeDegrees);
      if (latitudeMinutes) y += Number(latitudeMinutes) / 60;
      if (latitudeSeconds) y += Number(latitudeSeconds) / 3600;

      onChange({ x, y });
    } else {
      onChange(null);
    }
  }, [
    onChange,
    longitudeDegrees,
    latitudeDegrees,
    longitudeMinutes,
    longitudeSeconds,
    latitudeMinutes,
    latitudeSeconds,
  ]);

  return (
    <>
      <h4 className="mt-2">Longitude</h4>
      <RangeValidationInput
        className="mt-2"
        label="Degrees"
        min={-114.25}
        max={-108.7}
        onChange={setLongitudeDegrees}
        required
        type="number"
        value={longitudeDegrees}
      />
      <RangeValidationInput
        className="mt-2"
        label="Minutes (optional)"
        min={0}
        max={60}
        onChange={setLongitudeMinutes}
        type="number"
        value={longitudeMinutes}
      />
      <RangeValidationInput
        className="mt-2"
        label="Seconds (optional)"
        min={0}
        max={60}
        onChange={setLongitudeSeconds}
        type="number"
        value={setLongitudeSeconds}
      />

      <h4 className="mt-2">Latitude</h4>
      <RangeValidationInput
        className="mt-2"
        label="Degrees"
        min={36.7}
        max={42.18}
        onChange={setLatitudeDegrees}
        required
        type="number"
        value={latitudeDegrees}
      />
      <RangeValidationInput
        className="mt-2"
        label="Minutes (optional)"
        min={0}
        max={60}
        onChange={setLatitudeMinutes}
        type="number"
        value={latitudeMinutes}
      />
      <RangeValidationInput
        className="mt-2"
        label="Seconds (optional)"
        min={0}
        max={60}
        onChange={setLatitudeSeconds}
        type="number"
        value={latitudeSeconds}
      />
    </>
  );
}

DegreesMinutesSeconds.propTypes = {
  onChange: PropTypes.func.isRequired,
};
