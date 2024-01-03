import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Sketch from '@arcgis/core/widgets/Sketch';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import useMap from '../../../contexts/useMap';

export default function Shape({ send }) {
  const { mapView } = useMap();

  useEffect(() => {
    if (!mapView) return;

    const sketch = new Sketch({
      availableCreateTools: ['polygon', 'rectangle', 'circle'],
      creationMode: 'single',
      layer: new GraphicsLayer(),
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
      if (event.state === 'complete') {
        send({
          type: 'SET_FILTER',
          filter: {
            geometry: event.graphic.geometry,
            name: 'User-drawn Shape',
          },
        });
      }
    });

    mapView.ui.add(sketch, 'top-right');

    send({
      type: 'SET_FILTER',
      filter: {
        geometry: null,
        name: 'Shape',
      },
    });

    return () => {
      if (sketch) {
        mapView.ui.remove(sketch);
        sketch.destroy();
      }
    };
  }, [mapView, send]);

  return (
    <>
      <p>Use the toolbar on the map to draw a shape.</p>
      <p>Click once to create a new vertex.</p>
      <p>Double-click to finish the shape.</p>
      {/* buffer to make sure user can scroll far enough to see the entire select filter type dropdown */}
      <div className="h-28" />
    </>
  );
}

Shape.propTypes = {
  send: PropTypes.func.isRequired,
};
