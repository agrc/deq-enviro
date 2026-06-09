import Geometry from '@arcgis/core/geometry/Geometry';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import '@arcgis/map-components/components/arcgis-sketch';
import type { ArcgisSketch } from '@arcgis/map-components/components/arcgis-sketch';
import React, { useEffect, useRef } from 'react';

type ShapeSketchProps = {
  mapView: MapView | null;
  onCreate: (geometry: Geometry) => void;
};

type SketchCreateDetail = {
  state: string;
  graphic?: Graphic;
};

export default function ShapeSketch({ mapView, onCreate }: ShapeSketchProps) {
  const sketchElement = useRef<ArcgisSketch>(null);

  useEffect(() => {
    const sketch = sketchElement.current;
    const map = mapView?.map;

    if (!map || !sketch) return;

    const layer = new GraphicsLayer();
    map.add(layer);

    sketch.availableCreateTools = [
      'polygon',
      'rectangle',
      'circle',
      'point',
      'polyline',
    ];
    sketch.creationMode = 'single';
    sketch.layer = layer;
    sketch.layout = 'vertical';
    sketch.hideSelectionToolsRectangleSelection = true;
    sketch.hideSelectionToolsLassoSelection = true;
    sketch.hideSettingsMenu = true;

    const handleArcgisCreate = (event: Event) => {
      const { state, graphic } = (event as CustomEvent<SketchCreateDetail>)
        .detail;

      if (state === 'start') {
        layer.removeAll();
      } else if (state === 'complete' && graphic?.geometry) {
        layer.removeAll();
        layer.add(graphic);
        onCreate(graphic.geometry);
      }
    };

    sketch.addEventListener('arcgisCreate', handleArcgisCreate);
    sketch.create('polygon');

    return () => {
      sketch.removeEventListener('arcgisCreate', handleArcgisCreate);
      layer.removeAll();

      map.remove(layer);
    };
  }, [mapView, onCreate]);

  return (
    <React.Fragment>
      <arcgis-sketch ref={sketchElement} slot="top-right" />
    </React.Fragment>
  );
}
