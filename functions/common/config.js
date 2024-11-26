import { array, bool, string } from 'yup';

/** @typedef {'text' | 'number'} FieldType */
/** @typedef {{ value: string; alias: string }} Option */

/**
 * @typedef {{
 *   type: 'field';
 *   field: string;
 *   fieldType: FieldType;
 *   label: string;
 *   options: Option[];
 * }} FieldFilterConfig
 */

/**
 * @typedef {{
 *   type: 'checkbox' | 'radio';
 *   options: Option[];
 * }} CheckboxRadioQueriesFilterConfig
 */

/**
 * @typedef {{
 *   type: 'date';
 *   field: string;
 *   label: string;
 * }} DateFilterConfig
 */

/**
 * @typedef {{
 *   field: string;
 *   label: string;
 * }} AdditionalSearchConfig
 */

/**
 * @typedef {{
 *   name: string;
 *   alias: string;
 * }} Field
 */

/**
 * @typedef {{
 *   'Table Name': string;
 *   'Layer Name': string;
 *   'Geometry Type': string;
 *   'Division Heading': string;
 *   'Layer Description': string;
 *   'Metadata Link': string;
 *   'Special Filters': (
 *     | FieldFilterConfig
 *     | CheckboxRadioQueriesFilterConfig
 *     | DateFilterConfig
 *   )[];
 *   'Special Filter Default To On': boolean;
 *   'Additional Searches': AdditionalSearchConfig[];
 *   'OID Field': string;
 *   ID: string;
 *   NAME: string;
 *   'Custom Symbology Field': string;
 *   'Legend Title': string;
 *   'Map Label Field': string;
 *   'Sort Field': string;
 *   'Identify Fields': (string | Field)[];
 *   'Result Grid Fields': (string | Field)[];
 *   'Related Tables': string;
 *   'Document Search': string;
 *   'GRAMA Request': string;
 *   'Permit Information': string;
 *   'Additional Information': string;
 *   Comments: string;
 *   'Feature Service': string;
 *   'Coded Values': string;
 * }} QueryLayerConfig
 */

/**
 * @typedef {{
 *   'Additional Information': string;
 *   'Additional Information Link Fields': string[];
 *   'Feature Service': string;
 *   'Grid Fields': (string | Field)[];
 *   'OID Field': string;
 *   'SGID Table Name': string;
 *   'Table Name': string;
 *   'Tab Name': string;
 * }} RelatedTableConfig
 */

/**
 * @typedef {{
 *   'Parent Dataset Name': string;
 *   'Primary Key': string;
 *   'Related Table Name': string;
 *   'Foreign Key': string;
 *   nestedRelationships?: RelationshipClassConfig[];
 * }} RelationshipClassConfig
 */

// use a different regex that yup to allow for the {FieldName} syntax
const urlRegex = /https?:\/\//i;
const invalidUrl = '"${value}" must be a valid URL ("{" and "}" are allowed)';

export function transformFields(value) {
  const entries = value.split(',').map(trim);

  return entries.map((entry) => {
    const match = entry.match(/^(.*)\(([^()]*(?:\([^()]*\)[^()]*)*)\)$/);

    if (match) {
      return {
        name: match[1].trim(),
        alias: match[2].trim(),
      };
    }

    return entry;
  });
}

export function transformYesNoToBoolean(value) {
  if (value === 'Y') {
    return true;
  }

  return false;
}

export function getValueAndAlias(value) {
  console.log(value);
  const parts = /(^.*?)\s\(((?:[^()]*|\([^()]*\))*)\)(?![^()]*\()/.exec(value);

  if (!parts) {
    throw new Error(`Invalid field value: ${value}`);
  }

  return {
    value: parts[1],
    alias: parts[2],
  };
}

function trim(value) {
  return value.trim();
}

const filterTypes = ['field', 'checkbox', 'radio', 'date', 'query'];
/**
 * @param {string} value
 * @returns {(
 *   | FieldFilterConfig
 *   | CheckboxRadioQueriesFilterConfig
 *   | DateFilterConfig
 * )[]}
 */
export function transformSpecialFilters(value) {
  if (!value || value.length === 0) {
    return [];
  }

  const filterConfigs = value.split(';').map(trim);

  /**
   * @param {string} config
   * @returns {FieldFilterConfig
   *   | CheckboxRadioQueriesFilterConfig
   *   | DateFilterConfig}
   */
  return filterConfigs.map((config) => {
    const parts = /(^.+?):\s(.+$)/.exec(config);
    const type = parts[1];
    const optionsConfig = parts[2];

    if (!filterTypes.includes(type)) {
      throw new Error(`Invalid filter type: ${type}`);
    }

    switch (type) {
      case 'field': {
        const fieldParts = optionsConfig
          .split(',')
          .map(trim)
          .map(getValueAndAlias);
        let fieldConfig = fieldParts.shift();

        const [fieldName, fieldType] = fieldConfig.value.split('|');

        if (!['text', 'number'].includes(fieldType)) {
          throw new Error(`Invalid field type: ${fieldType}`);
        }

        return {
          type,
          field: fieldName,
          fieldType: /** @type {FieldType} */ (fieldType),
          label: fieldConfig.alias,
          options: fieldParts,
        };
      }
      case 'checkbox':
      case 'radio': {
        const options = optionsConfig
          .split(',')
          .map(trim)
          .map(getValueAndAlias);

        return {
          type,
          options,
        };
      }
      case 'date': {
        const { value, alias } = getValueAndAlias(optionsConfig);

        return {
          type,
          field: value,
          label: alias,
        };
      }
      default:
        break;
    }
  });
}

/**
 * @param {string} value
 * @returns {AdditionalSearchConfig[]}
 */
export function transformAdditionalSearches(value) {
  if (!value || value.length === 0) {
    return [];
  }

  const entries = value.split(';').map(trim);

  return entries.map(getValueAndAlias).map(({ value, alias }) => {
    return {
      field: value,
      label: alias,
    };
  });
}

export const fieldConfigs = {
  queryLayers: {
    additionalInformation: {
      name: 'Additional Information',
      schema: string().matches(urlRegex, { message: invalidUrl }).nullable(),
    },
    additionalSearches: {
      name: 'Additional Searches',
      schema: array().nullable(),
      transform: transformAdditionalSearches,
    },
    codedValues: {
      name: 'Coded Values',
      schema: string().nullable(),
    },
    comments: {
      name: 'Comments',
      schema: string().nullable(),
    },
    customSymbologyField: {
      name: 'Custom Symbology Field',
      schema: string().nullable(),
    },
    divisionHeading: {
      name: 'Division Heading',
      schema: string().required(),
    },
    documentSearch: {
      name: 'Document Search',
      schema: string().matches(urlRegex, { message: invalidUrl }).nullable(),
    },
    featureService: {
      name: 'Feature Service',
      schema: string().url().required(),
    },
    geometryType: {
      name: 'Geometry Type',
      schema: string().nullable(),
    },
    gramaRequest: {
      name: 'GRAMA Request',
      schema: string().matches(urlRegex, { message: invalidUrl }).nullable(),
    },
    identifyFields: {
      name: 'Identify Fields',
      schema: array().required(),
      transform: transformFields,
    },
    idField: {
      name: 'ID Field',
      schema: string().required(),
    },
    layerDescription: {
      name: 'Layer Description',
      schema: string().required(),
    },
    layerName: {
      name: 'Layer Name',
      schema: string().required(),
    },
    legendTitle: {
      name: 'Legend Title',
      schema: string().nullable(),
    },
    mapLabelField: {
      name: 'Map Label Field',
      schema: string().nullable(),
    },
    metadataLink: {
      name: 'Metadata Link',
      schema: string().matches(urlRegex, { message: invalidUrl }).nullable(),
    },
    nameField: {
      name: 'Name Field',
      schema: string().required(),
    },
    oidField: {
      name: 'OID Field',
      schema: string().nullable(),
    },
    permitInformation: {
      name: 'Permit Information',
      schema: string().matches(urlRegex, { message: invalidUrl }).nullable(),
    },
    relatedTables: {
      name: 'Related Tables',
      schema: string().nullable(),
    },
    resultGridFields: {
      name: 'Result Grid Fields',
      schema: array().required(),
      transform: transformFields,
    },
    sgidFeatureClassName: {
      name: 'SGID Feature Class Name',
      schema: string().nullable(),
    },
    sortField: {
      name: 'Sort Field',
      schema: string().nullable(),
    },
    specialFilterDefaultToOn: {
      name: 'Special Filter Default To On',
      schema: bool(),
      transform: transformYesNoToBoolean,
    },
    specialFilters: {
      name: 'Special Filters',
      schema: array(),
      transform: transformSpecialFilters,
    },
    tableName: {
      name: 'Table Name',
      schema: string().nullable(),
    },
  },
  relatedTables: {
    additionalInformation: {
      name: 'Additional Information',
      schema: string().matches(urlRegex, { message: invalidUrl }).nullable(),
    },
    additionalInformationLinkFields: {
      name: 'Additional Information Link Fields',
      scheme: array().nullable(),
      transform: transformFields,
    },
    featureService: {
      name: 'Feature Service',
      schema: string().url().required(),
    },
    gridFields: {
      name: 'Grid Fields',
      schema: array().required(),
      transform: transformFields,
    },
    oidField: {
      name: 'OID Field',
      schema: string().nullable(),
    },
    sgidTableName: {
      name: 'SGID Table Name',
      schema: string().nullable(),
    },
    tableName: {
      name: 'Table Name',
      schema: string().required(),
    },
    tabName: {
      name: 'Tab Name',
      schema: string().nullable(),
    },
  },
  relationshipClasses: {
    parentDatasetName: {
      name: 'Parent Dataset Name',
      schema: string().required(),
    },
    primaryKey: {
      name: 'Primary Key',
      schema: string().required(),
    },
    relatedTableName: {
      name: 'Related Table Name',
      schema: string().required(),
    },
    foreignKey: {
      name: 'Foreign Key',
      schema: string().required(),
    },
  },
};

/**
 * @param {Record<string, Object>} fieldConfigs
 * @returns {Record<string, string>}
 */
function getFieldNames(fieldConfigs) {
  return Object.keys(fieldConfigs).reduce((obj, key) => {
    obj[key] = fieldConfigs[key].name;

    return obj;
  }, {});
}

/**
 * @param {Record<string, object>} fieldConfigs
 * @returns {Record<string, string>}
 */
function getFieldKeys(fieldConfigs) {
  return Object.keys(fieldConfigs).reduce((obj, key) => {
    obj[fieldConfigs[key].name] = key;

    return obj;
  }, {});
}

export const fieldNames = {
  queryLayers: getFieldNames(fieldConfigs.queryLayers),
  relatedTables: getFieldNames(fieldConfigs.relatedTables),
  relationshipClasses: getFieldNames(fieldConfigs.relationshipClasses),
};

export const fieldKeys = {
  queryLayers: getFieldKeys(fieldConfigs.queryLayers),
  relatedTables: getFieldKeys(fieldConfigs.relatedTables),
  relationshipClasses: getFieldKeys(fieldConfigs.relationshipClasses),
};

export const downloadFormats = {
  csv: 'csv',
  excel: 'excel',
  filegdb: 'filegdb',
  geojson: 'geojson',
  shapefile: 'shapefile',
};
