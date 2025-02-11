import { type Geometry } from '@arcgis/core/geometry';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { useEffect, useRef, useState } from 'react';
import appConfig from '../../../app-config';
import useMap from '../../../contexts/useMap';
import Sherlock, {
  LocatorSuggestProvider,
} from '../../../utah-design-system/Sherlock';
import Buffer from './Buffer';

type StreetAddressProps = {
  // eslint-disable-next-line no-unused-vars
  send: (value: {
    type: string;
    filter?: {
      geometry: Geometry | null;
      name: string;
    };
  }) => void;
};

export default function StreetAddress({ send }: StreetAddressProps) {
  const [sherlockConfig, setSherlockConfig] = useState(null);
  const [address, setAddress] = useState(null);
  const [bufferGeometry, setBufferGeometry] = useState(null);

  const { mapView } = useMap();

  useEffect(() => {
    const filter =
      bufferGeometry && address
        ? {
            geometry: bufferGeometry,
            name: `Street Address: ${address?.attributes?.Match_addr}`,
          }
        : {
            geometry: null,
            name: null,
          };
    send({ type: 'SET_FILTER', filter });
  }, [address, bufferGeometry, send]);

  const graphicsLayer = useRef<GraphicsLayer | null>(null);
  useEffect(() => {
    if (!mapView) return;

    graphicsLayer.current = new GraphicsLayer();
    mapView.map.add(graphicsLayer.current);

    return () => {
      if (graphicsLayer.current) {
        mapView.map.remove(graphicsLayer.current);
      }
    };
  }, [mapView]);

  useEffect(() => {
    const provider = new LocatorSuggestProvider(
      appConfig.urls.masquerade,
      3857,
    );
    setSherlockConfig({
      placeHolder: 'street address, city or zip',
      onSherlockMatch: (features) => {
        graphicsLayer.current.removeAll();
        graphicsLayer.current.add(features[0]);
        setAddress(features[0]);
      },
      provider,
      maxResultsToDisplay: 10,
      symbols: {
        point: {
          type: 'simple-marker',
          style: 'circle',
          color: [255, 55, 55],
          size: 5,
        },
      },
    });
  }, [setSherlockConfig]);

  return (
    <>
      <Buffer onChange={setBufferGeometry} inputGeometry={address?.geometry} />
      {sherlockConfig && <Sherlock {...sherlockConfig} />}
      {/* buffer to make sure user can scroll far enough to see the entire select filter type dropdown */}
      <div className="h-28" />
    </>
  );
}
