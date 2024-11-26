import AreaMeasurement2D from '@arcgis/core/widgets/AreaMeasurement2D';
import DistanceMeasurement2D from '@arcgis/core/widgets/DistanceMeasurement2D';
import Measurement from '@arcgis/core/widgets/Measurement';
import { CalciteIcon } from '@esri/calcite-components-react';
import '@esri/calcite-components/dist/components/calcite-icon';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import useMap from '../contexts/useMap';

export default function MeasureTools() {
  const { mapView } = useMap();

  const distanceMeasurement2D = useRef<DistanceMeasurement2D>(null);
  const areaMeasurement2D = useRef<AreaMeasurement2D>(null);
  const measurement = useRef<Measurement>(null);
  const drawingToolbarRef = useRef<HTMLDivElement>(null);

  const [activeTool, setActiveTool] = useState<'distance' | 'area' | null>(
    null,
  );

  useEffect(() => {
    if (!mapView) return;

    distanceMeasurement2D.current = new DistanceMeasurement2D({
      view: mapView,
      visible: false,
    });
    areaMeasurement2D.current = new AreaMeasurement2D({
      view: mapView,
      visible: false,
    });
    measurement.current = new Measurement();

    mapView.when(() => {
      mapView.ui.add(drawingToolbarRef.current, 'top-left');
      mapView.ui.add(measurement.current, 'bottom-right');
      measurement.current.view = mapView;
    });
  }, [mapView]);

  const onDistanceButtonClick = (event) => {
    const toolName = 'distance';
    measurement.current.activeTool = toolName;
    setActiveTool(toolName);
    event.target.classList.add('active');
  };

  const onAreaButtonClick = (event) => {
    const toolName = 'area';
    measurement.current.activeTool = toolName;
    setActiveTool(toolName);
    event.target.classList.add('active');
  };

  const onClearButtonClick = () => {
    setActiveTool(null);
    measurement.current.clear();
  };

  return (
    <div>
      <div ref={drawingToolbarRef} className="esri-component esri-widget">
        <button
          className={twMerge([
            'esri-widget--button esri-interactive',
            activeTool === 'area' && 'bg-slate-200',
          ])}
          onClick={onAreaButtonClick}
          type="button"
          title="Measure area"
        >
          <CalciteIcon icon="measure-area" scale="s" />
        </button>
        <button
          className={twMerge([
            'esri-widget--button esri-interactive',
            activeTool === 'distance' && 'bg-slate-200',
          ])}
          onClick={onDistanceButtonClick}
          type="button"
          title="Measure distance between two or more points"
        >
          <CalciteIcon icon="measure" scale="s" />
        </button>
        <button
          className="esri-widget--button esri-interactive"
          title="Clear Measurements"
          onClick={onClearButtonClick}
        >
          <CalciteIcon icon="trash" scale="s" />
        </button>
      </div>
    </div>
  );
}
