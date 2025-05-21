import Geometry from '@arcgis/core/geometry/Geometry';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Sketch from '@arcgis/core/widgets/Sketch';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
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
  const { mapView } = useMap();
  const [bufferGeometry, setBufferGeometry] = useState<Geometry | null>(null);
  const [sketchGeometry, setSketchGeometry] = useState<Geometry | null>(null);

  useEffect(() => {
    if (!mapView) return;

    const layer = new GraphicsLayer();
    mapView.map.add(layer);
    const sketch = new Sketch({
      availableCreateTools: [
        'polygon',
        'rectangle',
        'circle',
        'point',
        'polyline',
      ],
      creationMode: 'single',
      layer,
      layout: 'vertical',
      view: mapView,
      visibleElements: {
        selectionTools: {
          'rectangle-selection': false,
          'lasso-selection': false,
        },
        settingsMenu: false,
      },
    });

    sketch.create('polygon');

    sketch.on('create', (event) => {
      if (event.state === 'start') {
        layer.removeAll();
      } else if (event.state === 'complete') {
        setSketchGeometry(event.graphic.geometry);
      }
    });

    mapView.ui.add(sketch, 'top-right');

    return () => {
      if (sketch) {
        sketch.destroy();
      }
      if (sketch && mapView?.ui) {
        mapView.ui.remove(sketch);
      }
      if (layer && mapView.map) {
        mapView.map.remove(layer);
      }
    };
  }, [mapView, send]);

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
    <>
      <p>Use the toolbar on the map to draw a shape.</p>
      <p>Click once to create a new vertex.</p>
      <p>Double-click to finish the shape.</p>
      <Buffer
        onChange={setBufferGeometry}
        inputGeometry={sketchGeometry}
        allowZero={!bufferGeometryTypes.includes(sketchGeometry?.type)}
      />
      {/* buffer to make sure user can scroll far enough to see the entire select filter type dropdown */}
      <div className="h-28" />
    </>
  );
}

Shape.propTypes = {
  send: PropTypes.func.isRequired,
};
