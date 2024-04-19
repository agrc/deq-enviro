import { object } from 'yup';
import { fieldConfigs } from './config.js';

function getSchema(fieldConfigs) {
  return Object.keys(fieldConfigs).reduce((obj, key) => {
    obj[fieldConfigs[key].name] = fieldConfigs[key].schema;

    return obj;
  }, {});
}

export const schemas = {
  queryLayers: object(getSchema(fieldConfigs.queryLayers)),
  relatedTables: object(getSchema(fieldConfigs.relatedTables)),
};
