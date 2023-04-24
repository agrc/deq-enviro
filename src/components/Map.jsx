import Map from '@arcgis/core/Map';
import esriConfig from '@arcgis/core/config';
import MapView from '@arcgis/core/views/MapView';
import LayerSelector from '@ugrc/layer-selector';
import '@ugrc/layer-selector/src/LayerSelector.css';
import { useEffect, useRef, useState } from 'react';

esriConfig.assetsPath = '/assets';

const initialExtent = {
  type: 'extent',
  xmax: -11762120.612131765,
  xmin: -13074391.513731329,
  ymax: 5225035.106177688,
  ymin: 4373832.359194187,
  spatialReference: 3857,
};
export default function MapComponent() {
  const mapDiv = useRef(null);
  const [selectorOptions, setSelectorOptions] = useState(null);
  useEffect(() => {
    const map = new Map();

    const view = new MapView({
      container: mapDiv.current,
      map,
      extent: initialExtent,
    });

    setSelectorOptions({
      view,
      quadWord: import.meta.env.VITE_DISCOVER_KEY,
      baseLayers: ['Hybrid', 'Lite', 'Terrain', 'Topo', 'Color IR'],
    });

    return () => {
      view.destroy();
      map.destroy();
    };
  }, []);

  return (
    <div className="h-full w-full" ref={mapDiv}>
      {selectorOptions ? (
        <LayerSelector {...selectorOptions}></LayerSelector>
      ) : null}
    </div>
  );
}
