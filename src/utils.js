import appConfig from './app-config';

export function getAlias(fieldName, fields) {
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
