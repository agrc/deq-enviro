import type { ArcgisAreaMeasurement2d } from '@arcgis/map-components/components/arcgis-area-measurement-2d';
import type { ArcgisDistanceMeasurement2d } from '@arcgis/map-components/components/arcgis-distance-measurement-2d';
import type { ArcgisSketch } from '@arcgis/map-components/components/arcgis-sketch';
import type React from 'react';

type ArcgisElementProps<T extends HTMLElement> = React.DetailedHTMLProps<
  React.HTMLAttributes<T>,
  T
> & {
  referenceElement?: string;
};

type CalciteButtonProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  appearance?: 'solid' | 'outline' | 'outline-fill' | 'transparent';
  iconStart?: string;
  kind?: 'brand' | 'danger' | 'inverse' | 'neutral' | 'success' | 'warning';
  scale?: 's' | 'm' | 'l';
  type?: 'button' | 'reset' | 'submit';
  width?: 'auto' | 'full' | 'half';
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'arcgis-area-measurement-2d': ArcgisElementProps<ArcgisAreaMeasurement2d>;
      'arcgis-distance-measurement-2d': ArcgisElementProps<ArcgisDistanceMeasurement2d>;
      'arcgis-sketch': ArcgisElementProps<ArcgisSketch>;
      'calcite-button': CalciteButtonProps;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'arcgis-area-measurement-2d': ArcgisElementProps<ArcgisAreaMeasurement2d>;
      'arcgis-distance-measurement-2d': ArcgisElementProps<ArcgisDistanceMeasurement2d>;
      'arcgis-sketch': ArcgisElementProps<ArcgisSketch>;
      'calcite-button': CalciteButtonProps;
    }
  }
}
