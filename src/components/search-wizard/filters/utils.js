import { fieldNames } from '../../../../functions/common/config';

/**
 * Returns an error message if the value is outside the range. Otherwise,
 * returns null.
 *
 * @param {string} value
 * @param {number} min
 * @param {number} max
 * @returns {string | null}
 */
export function validate(value, min, max) {
  if (!value || value.trim() === '') return null;

  const parsedValue = Number(value);
  if (parsedValue < min || parsedValue > max) {
    return `Value must be between ${min.toLocaleString()} and ${max.toLocaleString()}.`;
  }

  return null;
}

/**
 * @param {import('../../../SearchMachineProvider').Attribute} attributeFilterConfig
 * @param {import('../../../../functions/common/config').QueryLayerConfig} layerConfig
 * @param {{ name: string; type: string }[]} fields
 * @returns {string}
 */
export function getWhere(attributeFilterConfig, layerConfig, fields) {
  if (!attributeFilterConfig) return null;

  const { values, queryType, attributeType } = attributeFilterConfig;
  const fieldProp =
    attributeType === 'name'
      ? fieldNames.queryLayers.nameField
      : fieldNames.queryLayers.idField;
  const field = layerConfig[fieldProp];
  const fieldInfo = fields.find((f) => f.name === field);
  if (!fieldInfo) throw new Error(`Field ${field} not found in fields.`);
  const fieldType = fieldInfo.type;
  if (fieldType === 'esriFieldTypeString') {
    const joiner = queryType === 'all' ? ' AND ' : ' OR ';

    return values
      .map((value) => `upper(${field}) LIKE upper('%${value}%')`)
      .join(joiner);
  } else if (
    [
      'esriFieldTypeInteger',
      'esriFieldTypeDouble',
      'esriFieldTypeOID',
      'esriFieldTypeSingle',
      'esriFieldTypeSmallInteger',
    ].includes(fieldType)
  ) {
    return `${field} in (${values.join(', ')})`;
  } else {
    throw new Error(`Field type ${fieldType} is not supported.`);
  }
}
