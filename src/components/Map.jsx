import Map from '@arcgis/core/Map';
import { whenOnce } from '@arcgis/core/core/reactiveUtils';
import Polygon from '@arcgis/core/geometry/Polygon';
import { union } from '@arcgis/core/geometry/geometryEngine';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapView from '@arcgis/core/views/MapView';
import LayerSelector from '@ugrc/layer-selector';
import '@ugrc/layer-selector/src/LayerSelector.css';
import { useEffect, useRef, useState } from 'react';
import { fieldNames } from '../../functions/common/config';
import { supportsExport } from '../../functions/common/validation';
import { useSearchMachine } from '../SearchMachineProvider';
import appConfig from '../app-config';
import stateOfUtah from '../data/state-of-utah.json';

const stateOfUtahPolygon = new Polygon(stateOfUtah);
const stateOfUtahExtent = stateOfUtahPolygon.extent;

function useMapGraphic(mapView, graphic) {
  const previousGraphic = useRef(null);
  useEffect(() => {
    if (!mapView) return;

    mapView.graphics.removeAll();

    if (!graphic) return;

    mapView.graphics.add(graphic);

    if (JSON.stringify(graphic.geometry) === previousGraphic.current) return;

    previousGraphic.current = JSON.stringify(graphic.geometry);

    console.log('goTo');
    mapView.goTo(graphic).catch((error) => {
      if (error.name !== 'AbortError') {
        throw error;
      }
      console.error('goTo error', error);
    });
  }, [graphic, mapView]);
}

export default function MapComponent() {
  const [state, send] = useSearchMachine();
  const [selectorOptions, setSelectorOptions] = useState(null);

  const map = useRef(null);
  const view = useRef(null);
  const filterGraphic = (state.matches('advanced') ||
    state.matches('searching') ||
    state.matches('result')) &&
    state.context?.filter?.geometry && {
      geometry: state.context?.filter?.geometry,
      symbol: appConfig.symbols.filter,
    };
  useMapGraphic(view.current, filterGraphic);

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
      baseLayers: ['Lite', 'Terrain', 'Topo', 'Hybrid', 'Color IR'],
    });

    return () => {
      view.current.destroy();
      map.current.destroy();
    };
  }, []);

  const searching = useRef(false);
  useEffect(() => {
    if (state.matches('selectLayers')) {
      map.current.removeAll();
      view.current.goTo(stateOfUtahExtent);

      return;
    }

    if (!state.matches('searching')) {
      return;
    }

    async function searchLayer(layer, filter) {
      try {
        const featureLayer = new FeatureLayer({
          url: layer[fieldNames.queryLayers.featureService],
          outFields: layer[fieldNames.queryLayers.resultGridFields],
          definitionExpression: filter?.where,
        });
        map.current.add(featureLayer);

        // does this really make sure that all features have been loaded?
        const layerView = await view.current.whenLayerView(featureLayer);
        layerView.filter = {
          geometry: filter.geometry,
        };

        await whenOnce(() => layerView.updating === false);
        const { count, extent } = await layerView.queryExtent();
        const featureSet = await layerView.queryFeatures();

        const supportsExportValue = supportsExport(featureLayer.sourceJSON);
        if (!supportsExportValue) {
          console.warn('Layer does not support exporting', layer);
        }

        send('RESULT', {
          result: {
            ...layer,
            features: featureSet.features,
            count,
            supportedExportFormats:
              featureLayer.sourceJSON.supportedExportFormats,
            supportsExport: supportsExportValue,
          },
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
