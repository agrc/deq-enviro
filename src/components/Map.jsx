import Map from '@arcgis/core/Map';
import Polygon from '@arcgis/core/geometry/Polygon';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
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
import {
  getDefaultRenderer,
  hasDefaultSymbology,
  queryFeatures,
  getLayerByUniqueId,
} from '../utils';
import { getWhere } from './search-wizard/filters/utils';
import { useRemoteConfigString } from 'reactfire';

const stateOfUtahPolygon = new Polygon(stateOfUtah);
const stateOfUtahExtent = stateOfUtahPolygon.extent;
const searchLayerIdPrefix = 'search-layer';

function useMapGraphic(mapView, graphic) {
  const previousGraphic = useRef(null);
  const previousGoTo = useRef(null);
  const graphicsLayer = useRef(null);

  useEffect(() => {
    const giddyUp = async () => {
      if (!mapView) return;

      if (!graphicsLayer.current) {
        graphicsLayer.current = new GraphicsLayer();
        mapView.map.add(graphicsLayer.current);
      }

      if (!graphic) {
        if (previousGraphic.current) {
          graphicsLayer.current.removeAll();

          previousGraphic.current = null;
        }

        return;
      }

      if (JSON.stringify(graphic.geometry) !== previousGraphic.current) {
        graphicsLayer.current.removeAll();

        graphicsLayer.current.add(graphic);

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

  const { data: queryLayersJSON } = useRemoteConfigString('queryLayers');
  const queryLayers = JSON.parse(queryLayersJSON || '[]');

  const mapDiv = useRef(null);
  useEffect(() => {
    map.current = new Map();

    view.current = new MapView({
      container: mapDiv.current,
      map: map.current,
      extent: stateOfUtahExtent,
      constraints: {
        maxZoom: 17,
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

    /**
     * @param {import('../../functions/common/config').QueryLayerConfig} layer
     * @param {import('../SearchMachineProvider').Filter} filter
     * @returns Promise
     */
    async function searchLayer(layer, filter) {
      try {
        const featureServiceUrl = layer[fieldNames.queryLayers.featureService];

        /**
         * @type {Object} featureServiceJson
         * @property {string} serviceItemId
         * @property {string} id
         */
        const featureServiceJson = await ky(
          `${featureServiceUrl}?f=json`,
        ).json();

        /** @type {import('@arcgis/core/layers/FeatureLayer').default} */
        let featureLayer;
        if (featureServiceJson.serviceItemId) {
          // this could be a feature layer or group layer
          const mapLayer = await fromPortalItem({
            portalItem: {
              id: featureServiceJson.serviceItemId,
            },
          });

          featureLayer =
            mapLayer.type === 'group'
              ? mapLayer.findLayerById(featureServiceJson.id)
              : mapLayer;
        } else {
          featureLayer = new FeatureLayer({
            url: layer[fieldNames.queryLayers.featureService],
          });
        }

        const where = getWhere(
          filter.attribute,
          layer,
          featureServiceJson.fields,
        );
        featureLayer.outFields = [featureServiceJson.objectIdField];
        featureLayer.id = `${searchLayerIdPrefix}:${
          layer[fieldNames.queryLayers.uniqueId]
        }`;
        featureLayer.popupEnabled = false;

        const extentQuery = featureLayer.createQuery();
        extentQuery.where = where;
        extentQuery.geometry = filter.geometry;

        const { count, extent } = await featureLayer.queryExtent(extentQuery);

        if (count > appConfig.maxSearchCount) {
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

          featureLayer.opacity = appConfig.symbols.defaultOpacity;
        }

        // this essentially applies a geometry filter to the layer before it's added to the map
        // this is done to prevent the map from requesting ALL of the features from the layer
        const ids = await featureLayer.queryObjectIds({
          where,
          geometry: filter.geometry,
        });
        featureLayer.definitionExpression = ids?.length
          ? `${featureLayer.objectIdField} IN (${ids.join(',')})`
          : '1=0';

        // I could't get a client-side query on the layer view to work
        // since the map extent could be anything
        const query = featureLayer.createQuery();
        query.where = featureLayer.definitionExpression;
        query.outFields = [
          ...layer[fieldNames.queryLayers.resultGridFields],
          featureServiceJson.objectIdField || 'OBJECTID',
        ];
        query.returnGeometry = false;
        const features = await queryFeatures(featureLayer, query);

        const supportsExportValue = supportsExport(featureLayer.sourceJSON);
        if (!supportsExportValue) {
          console.warn('Layer does not support exporting', layer);
        }

        map.current.add(
          featureLayer,
          featureLayer.geometryType === 'polygon' ? 1 : null,
        );

        send('RESULT', {
          result: {
            ...layer,
            features,
            fields: featureServiceJson.fields,
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
        state.context.searchLayerIds.map((uniqueId) =>
          searchLayer(
            getLayerByUniqueId(uniqueId, queryLayers),
            state.context.filter,
          ),
        ),
      );

      // join extents
      const extent = extents
        .filter((extent) => extent)
        .reduce((totalExtent, extent) => {
          if (!totalExtent) {
            return extent;
          }

          return totalExtent.union(extent);
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
  }, [queryLayers, send, state]);

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
