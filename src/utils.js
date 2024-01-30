import appConfig from './app-config';
import { fieldNames } from '../functions/common/config';

export function getAlias(fieldName, fields) {
  if (!fields) return fieldName;

  const field = fields.find((field) => field.name === fieldName);

  return field?.alias ?? fieldName;
}

export function hasDefaultSymbology(featureLayer) {
  if (featureLayer.renderer.type !== 'simple') return false;

  if (featureLayer.geometryType === 'point') {
    return featureLayer.renderer.symbol.size < 5;
  } else if (featureLayer.geometryType === 'polygon') {
    return featureLayer.renderer.symbol.outline.width < 0.8;
  }
}

let currentIndex = 0;
export function getDefaultRenderer(geometryType) {
  const renderer = appConfig.symbols[geometryType];
  renderer.symbol.color = appConfig.symbols.defaultColors[currentIndex];
  currentIndex =
    currentIndex + 1 === appConfig.symbols.defaultColors.length
      ? 0
      : currentIndex + 1;

  return renderer;
}

/**
 * Query all features from a feature layer paging through results if necessary
 *
 * @param {import('@arcgis/core/layers/FeatureLayer').default} featureLayer
 * @param {import('@arcgis/core/rest/support/Query').default} query
 * @returns {Promise<import('@arcgis/core/Graphic').default[]>}
 */
export async function queryFeatures(featureLayer, query) {
  const features = [];
  let start = 0;
  let finished = false;
  query.maxRecordCountFactor = 4;
  query.num =
    featureLayer.capabilities.query.maxRecordCount * query.maxRecordCountFactor;
  while (!finished) {
    query.start = start;
    const featureSet = await featureLayer.queryFeatures(query);

    features.push(...featureSet.features);

    if (featureSet.exceededTransferLimit) {
      start += featureLayer.capabilities.query.maxRecordCount;
    } else {
      finished = true;
    }
  }

  return features;
}

/**
 * @param {string} name
 * @param {import('../functions/common/config').QueryLayerConfig[]} layers
 */
export function getConfigByTableName(name, layers) {
  return layers.find(
    (layer) => layer[fieldNames.queryLayers.tableName] === name,
  );
}

/**
 * @param {string} tableName
 * @param {import('../functions/common/config').RelationshipClassConfig[]} allRelationships
 * @returns {import('../functions/common/config').RelationshipClassConfig[]}
 */
export function getRelationships(tableName, allRelationships) {
  return allRelationships.filter(
    (config) =>
      config[fieldNames.relationshipClasses.parentDatasetName] === tableName,
  );
}

/**
 * @param {import('./contexts/SearchMachineProvider').LayerFilterValue[]} layerFilterValues
 * @returns {string | null}
 */
export function getDefQueryFromLayerFilterValues(layerFilterValues) {
  if (!layerFilterValues || layerFilterValues.length === 0) return null;

  return layerFilterValues
    .map((layerFilter) => {
      switch (layerFilter.type) {
        case 'field': {
          const paddedValues =
            layerFilter.fieldType === 'text'
              ? layerFilter.values.map((value) => `'${value}'`)
              : layerFilter.values;

          return `${layerFilter.field} IN (${paddedValues.join(',')})`;
        }
        case 'radio': {
          return layerFilter.values[0];
        }
        case 'checkbox': {
          const paddedValues = layerFilter.values.map((value) => `(${value})`);

          return `(${paddedValues.join(' OR ')})`;
        }
        case 'date': {
          return `${layerFilter.field} >= '${layerFilter.values[0]}' AND ${layerFilter.field} <= '${layerFilter.values[1]}'`;
        }
        default:
          throw new Error(`Invalid filter type: ${layerFilter.type}`);
      }
    })
    .join(' AND ');
}
