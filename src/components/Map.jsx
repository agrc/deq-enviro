import Map from '@arcgis/core/Map';
import esriConfig from '@arcgis/core/config';
import { whenOnce } from '@arcgis/core/core/reactiveUtils';
import Polygon from '@arcgis/core/geometry/Polygon';
import { union } from '@arcgis/core/geometry/geometryEngine';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapView from '@arcgis/core/views/MapView';
import LayerSelector from '@ugrc/layer-selector';
import '@ugrc/layer-selector/src/LayerSelector.css';
import { useEffect, useRef, useState } from 'react';
import { useSearchMachine } from '../SearchMachineProvider';
import { fieldNames } from '../config';
import stateOfUtah from '../data/state-of-utah.json';

const stateOfUtahPolygon = new Polygon(stateOfUtah);
const stateOfUtahExtent = stateOfUtahPolygon.extent;

esriConfig.assetsPath = '/assets';

export default function MapComponent() {
  const [state, send] = useSearchMachine();
  const [selectorOptions, setSelectorOptions] = useState(null);

  const map = useRef(null);
  const view = useRef(null);

  const mapDiv = useRef(null);
  useEffect(() => {
    map.current = new Map();

    view.current = new MapView({
      container: mapDiv.current,
      map: map.current,
      extent: stateOfUtahExtent,
    });

    setSelectorOptions({
      view: view.current,
      quadWord: import.meta.env.VITE_DISCOVER_KEY,
      baseLayers: ['Hybrid', 'Lite', 'Terrain', 'Topo', 'Color IR'],
    });

    return () => {
      view.current.destroy();
      map.current.destroy();
    };
  }, []);

  const searching = useRef(false);
  useEffect(() => {
    if (!state.matches('searching')) {
      return;
    }

    async function searchLayer(layer) {
      try {
        const featureLayer = new FeatureLayer({
          url: layer[fieldNames.queryLayers.featureService],
        });
        map.current.add(featureLayer);

        // does this really make sure that all features have been loaded?
        const layerView = await view.current.whenLayerView(featureLayer);
        layerView.filter = {
          geometry: stateOfUtahPolygon,
        };

        await whenOnce(() => layerView.updating === false);
        const { count, extent } = await layerView.queryExtent();
        const featureSet = await layerView.queryFeatures();
        send('RESULT', {
          result: { ...layer, features: featureSet.features, count },
        });

        return extent;
      } catch (error) {
        console.error(
          `error with layer ${layer[fieldNames.queryLayers.uniqueId]}`,
          error
        );

        send('RESULT', { result: { ...layer, error: error.message } });

        return null;
      }
    }

    async function search() {
      console.log('searching');
      searching.current = true;

      map.current.removeAll();

      const extents = await Promise.all(
        state.context.searchLayers.map((layer) =>
          searchLayer(layer, state.context.filter)
        )
      );

      // join extents
      const extent = extents.reduce((totalExtent, extent) => {
        if (!totalExtent) {
          return extent;
        }

        return union([totalExtent, extent]);
      }, null);

      send('COMPLETE', { extent });

      searching.current = false;
    }

    // this check feels a little hacky to me
    // maybe this logic should be moved to the machine?
    // two reasons why I kept it here:
    //  1 - xstate docs say that actions should only be for side effects that aren't likely to throw
    //  2 - I'm not sure how to update the resultLayers array from an action
    if (!searching.current) {
      search().catch((error) => {
        console.error('error searching', error);
        send('ERROR', { message: error.message });

        searching.current = false;
      });
    }
  }, [send, state]);

  useEffect(() => {
    if (state.context.resultExtent) {
      // zoom to result extent
      view.current.goTo(state.context.resultExtent);
    }
  }, [state.context.resultExtent]);

  return (
    <div className="w-full flex-1" ref={mapDiv}>
      {selectorOptions ? (
        <LayerSelector {...selectorOptions}></LayerSelector>
      ) : null}
    </div>
  );
}
