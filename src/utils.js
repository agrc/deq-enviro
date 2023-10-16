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
