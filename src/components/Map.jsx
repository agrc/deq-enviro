import Map from '@arcgis/core/Map';
import { whenOnce } from '@arcgis/core/core/reactiveUtils';
import Polygon from '@arcgis/core/geometry/Polygon';
import { union } from '@arcgis/core/geometry/geometryEngine';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import { fromPortalItem } from '@arcgis/core/layers/support/fromPortalItem';
import MapView from '@arcgis/core/views/MapView';
import Expand from '@arcgis/core/widgets/Expand';
import Legend from '@arcgis/core/widgets/Legend';
import Print from '@arcgis/core/widgets/Print';
import LayerSelector from '@ugrc/layer-selector';
import '@ugrc/layer-selector/src/LayerSelector.css';
import ky from 'ky';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { fieldNames } from '../../functions/common/config';
import { supportsExport } from '../../functions/common/validation';
import { useSearchMachine } from '../SearchMachineProvider';
import appConfig from '../app-config';
import useMap from '../contexts/useMap';
import stateOfUtah from '../data/state-of-utah.json';
import Link from '../utah-design-system/Link';
import { getDefaultRenderer, hasDefaultSymbology } from '../utils';
import { getWhere } from './search-wizard/filters/utils';

const stateOfUtahPolygon = new Polygon(stateOfUtah);
const stateOfUtahExtent = stateOfUtahPolygon.extent;
const searchLayerIdPrefix = 'search-layer';

function useMapGraphic(mapView, graphic) {
  const previousGraphic = useRef(null);
  const previousGoTo = useRef(null);

  useEffect(() => {
    const giddyUp = async () => {
      if (!mapView) return;

      if (!graphic) {
        if (previousGraphic.current) {
          mapView.graphics.removeAll();

          previousGraphic.current = null;
        }

        return;
      }

      if (JSON.stringify(graphic.geometry) !== previousGraphic.current) {
        mapView.graphics.removeAll();

        mapView.graphics.add(graphic);

        previousGraphic.current = JSON.stringify(graphic.geometry);

        // this prevents the map from skipping a goTo and not zooming to the latest graphic
        if (previousGoTo.current) {
          await previousGoTo.current;
        }

        previousGoTo.current = mapView
          .goTo(graphic)
          .catch((error) => {
            if (error.name !== 'AbortError') {
              throw error;
            }
            console.error('goTo error', error);
          })
          .then(() => (previousGoTo.current = null));
      }
    };

    giddyUp();
  }, [graphic, mapView]);
}

function TooManyMessage({ metadataLink }) {
  return (
    <span>
      Your search returned more than the maximum number of records allowed for
      this application ({appConfig.maxSearchCount.toLocaleString()}).{' '}
      {metadataLink ? (
        <>
          You may either narrow your search or go to the{' '}
          <Link href={metadataLink} external>
            metadata page{' '}
          </Link>{' '}
          for this layer and find contact information where you may request the
          entire dataset directly from the steward.
        </>
      ) : (
        ' Please narrow your search.'
      )}
    </span>
  );
}

TooManyMessage.propTypes = {
  metadataLink: PropTypes.string,
};

export default function MapComponent() {
  const [state, send] = useSearchMachine();
  const [selectorOptions, setSelectorOptions] = useState(null);
  const { setMapView, selectedGraphicInfo, setSelectedGraphicInfo } = useMap();

  const map = useRef(null);
  const view = useRef(null);
  const filterGraphic = state.context?.filter?.geometry && {
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
      constraints: {
        maxZoom: 18,
      },
    });

    setMapView(view.current);

    view.current.when(() => {
      const print = new Expand({
        expandIcon: 'print',
        view: view.current,
        content: new Print({
          view: view.current,
          printServiceUrl: appConfig.urls.print,
          templateOptions: {
            title: 'Printed from the Utah DEQ Interactive Map',
          },
        }),
        label: 'Print',
      });

      view.current.ui.add(print, 'top-left');

      const legend = new Expand({
        expandIcon: 'legend',
        view: view.current,
        content: new Legend({ view: view.current }),
        label: 'Legend',
      });

      view.current.ui.add(legend, 'top-left');

      view.current.on('click', (event) => {
        view.current.hitTest(event).then(({ results }) => {
          // look for hit on search layer
          const hit = results.find((result) =>
            result.graphic.layer.id?.startsWith(searchLayerIdPrefix),
          );

          if (hit) {
            const { layer, attributes } = hit.graphic;

            setSelectedGraphicInfo({
              layerId: layer.id.split(':')[1],
              oid: attributes.OBJECTID,
            });
          } else {
            setSelectedGraphicInfo(null);
          }
        });
      });
    });

    setSelectorOptions({
      view: view.current,
      quadWord: import.meta.env.VITE_DISCOVER_KEY,
      baseLayers: ['Lite', 'Terrain', 'Topo', 'Hybrid', 'Color IR'],
      overlays: [
        {
          Factory: FeatureLayer,
          url: appConfig.urls.streams,
          id: 'NHD Streams',
          minScale: 144_500,
          renderer: {
            type: 'simple',
            symbol: {
              type: 'simple-line',
              color: [0, 122, 194, 0.75],
              width: 2,
              style: 'short-dash-dot',
            },
          },
        },
        {
          Factory: VectorTileLayer,
          url: appConfig.urls.parcels,
          id: 'Parcels',
          minScale: 144_500,
        },
        {
          Factory: VectorTileLayer,
          url: appConfig.urls.utahPLSS,
          id: 'Township/Range/Section',
        },
        {
          Factory: FeatureLayer,
          url: appConfig.urls.landOwnership,
          id: 'Land Ownership',
        },
        {
          Factory: FeatureLayer,
          url: appConfig.urls.environmentalCovenants,
          id: 'Environmental Covenants',
        },
        {
          Factory: FeatureLayer,
          url: appConfig.urls.HUC8,
          id: 'Hydrologic Units (HUC8)',
          legendEnabled: false,
          labelingInfo: [
            {
              labelExpressionInfo: {
                expression: '$feature.NAME',
              },
              symbol: {
                type: 'text',
                color: 'white',
                haloColor: 'gray',
                haloSize: 1,
              },
            },
          ],
          renderer: {
            type: 'simple',
            symbol: {
              type: 'simple-fill',
              color: [0, 122, 194, 0.3],
              outline: {
                color: [255, 255, 255, 0.65],
                width: 2,
                style: 'solid',
              },
              style: 'solid',
            },
          },
        },
      ],
    });

    return () => {
      view.current.destroy();
      map.current.destroy();
    };
  }, [setMapView, setSelectedGraphicInfo]);

  const removeSearchLayers = () => {
    if (searching.current) return;

    const removeLayers = map.current.layers.filter((layer) =>
      layer.id?.startsWith('search-layer'),
    );
    map.current.layers.removeMany(removeLayers);
  };

  const searching = useRef(false);
  useEffect(() => {
    if (state.matches('selectLayers')) {
      removeSearchLayers();
    }

    if (!state.matches('searching')) {
      return;
    }

    async function searchLayer(layer, filter) {
      try {
        const where = getWhere(filter.attribute, layer);
        const featureServiceUrl = layer[fieldNames.queryLayers.featureService];

        const featureServiceJson = await ky(
          `${featureServiceUrl}?f=json`,
        ).json();
        let featureLayer;
        if (featureServiceJson.serviceItemId) {
          // this could be a feature layer or group layer
          const layer = await fromPortalItem({
            portalItem: {
              id: featureServiceJson.serviceItemId,
            },
          });

          featureLayer =
            layer.type === 'group'
              ? layer.findLayerById(featureServiceJson.id)
              : layer;
        } else {
          featureLayer = new FeatureLayer({
            url: layer[fieldNames.queryLayers.featureService],
          });
        }

        featureLayer.outFields = layer[fieldNames.queryLayers.resultGridFields];
        featureLayer.definitionExpression = where;
        featureLayer.id = `${searchLayerIdPrefix}:${
          layer[fieldNames.queryLayers.uniqueId]
        }`;
        featureLayer.popupEnabled = false;

        const featureCount = await featureLayer.queryFeatureCount({
          where,
          geometry: filter.geometry,
        });

        if (featureCount > appConfig.maxSearchCount) {
          send('RESULT', {
            result: {
              ...layer,
              error: (
                <TooManyMessage
                  metadataLink={layer[fieldNames.queryLayers.metadataLink]}
                />
              ),
            },
          });

          return null;
        }

        if (hasDefaultSymbology(featureLayer)) {
          // assign a default symbol
          featureLayer.renderer = getDefaultRenderer(featureLayer.geometryType);

          if (featureLayer.geometryType === 'polygon') {
            featureLayer.opacity = appConfig.symbols.defaultOpacity;
          }
        }

        map.current.add(
          featureLayer,
          featureLayer.geometryType === 'polygon' ? 0 : null,
        );

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
            fields: featureSet.fields,
            count,
            supportedExportFormats:
              featureLayer.sourceJSON.supportedExportFormats,
            supportsExport: supportsExportValue,
            featureLayer,
          },
        });

        return extent;
      } catch (error) {
        console.error(
          `error with layer ${layer[fieldNames.queryLayers.uniqueId]}`,
          error,
        );

        send('RESULT', { result: { ...layer, error: error.message } });

        return null;
      }
    }

    async function search() {
      removeSearchLayers();

      searching.current = true;

      const extents = await Promise.all(
        state.context.searchLayers.map((layer) =>
          searchLayer(layer, state.context.filter),
        ),
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
    if (!searching.current && state.context.resultExtent === null) {
      removeSearchLayers();
      view.current.goTo(stateOfUtahExtent);

      return;
    }
  }, [state.context.resultExtent]);

  useEffect(() => {
    if (state.context.resultExtent) {
      // zoom to result extent
      view.current.goTo(state.context.resultExtent);
    }
  }, [state.context.resultExtent]);

  useEffect(() => {
    let handle;
    if (selectedGraphicInfo?.oid && selectedGraphicInfo?.layerId) {
      const layer = map.current.layers.find(
        (layer) => layer.id.split(':')[1] === selectedGraphicInfo.layerId,
      );

      view.current.whenLayerView(layer).then((layerView) => {
        handle = layerView.highlight(selectedGraphicInfo.oid);
      });
    }

    return () => {
      handle?.remove();
    };
  }, [selectedGraphicInfo, state.context.resultLayers]);

  return (
    <div className="w-full flex-1" ref={mapDiv}>
      {selectorOptions ? (
        <LayerSelector {...selectorOptions}></LayerSelector>
      ) : null}
    </div>
  );
}
