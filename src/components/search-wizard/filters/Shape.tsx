import Geometry from '@arcgis/core/geometry/Geometry';
import React, { useEffect, useState } from 'react';
import useMap from '../../../contexts/useMap';
import Buffer from './Buffer';

type ShapeProps = {
  send: (value: {
    type: string;
    filter?: {
      geometry: Geometry | null;
      name: string;
    };
  }) => void;
};

export default function Shape({ send }: ShapeProps) {
  const { setShapeSketchOptions } = useMap() as unknown as {
    setShapeSketchOptions: (
      options: { onCreate: (geometry: Geometry) => void } | null,
    ) => void;
  };
  const [bufferGeometry, setBufferGeometry] = useState<Geometry | null>(null);
  const [sketchGeometry, setSketchGeometry] = useState<Geometry | null>(null);

  useEffect(() => {
    setShapeSketchOptions({ onCreate: setSketchGeometry });

    return () => {
      setShapeSketchOptions(null);
    };
  }, [setShapeSketchOptions]);

  useEffect(() => {
    send({
      type: 'SET_FILTER',
      filter: {
        geometry: bufferGeometry,
        name: 'User-drawn Shape',
      },
    });
  }, [bufferGeometry, send]);

  const bufferGeometryTypes = ['point', 'polyline'];

  return (
    <React.Fragment>
      <p>Use the toolbar on the map to draw a shape.</p>
      <p>Click once to create a new vertex.</p>
      <p>Double-click to finish the shape.</p>
      <Buffer
        onChange={setBufferGeometry}
        inputGeometry={sketchGeometry}
        allowZero={
          !sketchGeometry || !bufferGeometryTypes.includes(sketchGeometry.type)
        }
      />
      {/* buffer to make sure user can scroll far enough to see the entire select filter type dropdown */}
      <div className="h-28" />
    </React.Fragment>
  );
}
