import '@arcgis/map-components/components/arcgis-area-measurement-2d';
import '@arcgis/map-components/components/arcgis-distance-measurement-2d';
import type { ArcgisAreaMeasurement2d } from '@arcgis/map-components/components/arcgis-area-measurement-2d';
import type { ArcgisDistanceMeasurement2d } from '@arcgis/map-components/components/arcgis-distance-measurement-2d';
import '@esri/calcite-components/dist/components/calcite-button';
import React, { useRef, useState } from 'react';

export default function MeasureTools() {
  const distanceMeasurement2D = useRef<ArcgisDistanceMeasurement2d>(null);
  const areaMeasurement2D = useRef<ArcgisAreaMeasurement2d>(null);

  const [activeTool, setActiveTool] = useState<'distance' | 'area' | null>(
    null,
  );

  const onDistanceButtonClick = async () => {
    await areaMeasurement2D.current?.clear();
    await distanceMeasurement2D.current?.start();
    setActiveTool('distance');
  };

  const onAreaButtonClick = async () => {
    await distanceMeasurement2D.current?.clear();
    await areaMeasurement2D.current?.start();
    setActiveTool('area');
  };

  const onClearButtonClick = async () => {
    setActiveTool(null);
    await Promise.all([
      distanceMeasurement2D.current?.clear(),
      areaMeasurement2D.current?.clear(),
    ]);
  };

  return (
    <React.Fragment>
      <div
        className="esri-widget flex flex-col shadow-md"
        slot="top-left"
      >
        <calcite-button
          appearance="transparent"
          className="measure-area"
          iconStart="measure-area"
          kind={activeTool === 'area' ? 'brand' : 'neutral'}
          onClick={onAreaButtonClick}
          scale="m"
          title="Measure area"
          type="button"
          width="auto"
        ></calcite-button>
        <calcite-button
          appearance="transparent"
          className="measure-distance"
          iconStart="measure"
          kind={activeTool === 'distance' ? 'brand' : 'neutral'}
          onClick={onDistanceButtonClick}
          scale="m"
          title="Measure distance between two or more points"
          type="button"
          width="auto"
        ></calcite-button>
        <calcite-button
          appearance="transparent"
          className="clear-measurements"
          iconStart="trash"
          kind="neutral"
          onClick={onClearButtonClick}
          scale="m"
          title="Clear Measurements"
          type="button"
          width="auto"
        ></calcite-button>
      </div>
      <arcgis-area-measurement-2d
        ref={areaMeasurement2D}
        slot="bottom-right"
        style={{ display: activeTool === 'area' ? undefined : 'none' }}
      />
      <arcgis-distance-measurement-2d
        ref={distanceMeasurement2D}
        slot="bottom-right"
        style={{ display: activeTool === 'distance' ? undefined : 'none' }}
      />
    </React.Fragment>
  );
}
