import { fieldNames } from '../../../../functions/common/config';

export function validate(value, min, max) {
  if (!value || value.trim() === '') return null;

  value = Number(value);
  if (value < min || value > max) {
    return `Value must be between ${min.toLocaleString()} and ${max.toLocaleString()}.`;
  }

  return null;
}

export function getWhere(attributeFilterConfig, layerConfig) {
  if (!attributeFilterConfig) return null;

  const { values, queryType, attributeType } = attributeFilterConfig;
  const fieldProp =
    attributeType === 'name'
      ? fieldNames.queryLayers.nameField
      : fieldNames.queryLayers.idField;
  const field = layerConfig[fieldProp];
  const joiner = queryType === 'all' ? ' AND ' : ' OR ';

  return values
    .map((value) => `upper(${field}) LIKE upper('%${value}%')`)
    .join(joiner);
}
