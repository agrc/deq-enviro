import { array, object, string } from 'yup';

export const fieldConfigs = {
  queryLayers: {
    additionalInformation: {
      name: 'Additional Information',
      schema: string().url().nullable(),
    },
    additionalSearches: {
      name: 'Additional Searches',
      schema: string().nullable(),
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
      schema: string().url().nullable(),
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
      schema: string().url().nullable(),
    },
    identifyAttributes: {
      name: 'Identify Attributes',
      schema: string().nullable(),
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
      schema: string().url().nullable(),
    },
    oidField: {
      name: 'OID Field',
      schema: string().nullable(),
    },
    permitInformation: {
      name: 'Permit Information',
      schema: string().url().nullable(),
    },
    relatedTables: {
      name: 'Related Tables',
      schema: string().nullable(),
    },
    resultGridFields: {
      name: 'Result Grid Fields',
      schema: array().of(string()).required(),
      transform: (value) => value.split(',').map((v) => v.trim()),
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
      schema: string().nullable(),
    },
    specialFilters: {
      name: 'Special Filters',
      schema: string().nullable(),
    },
    uniqueId: {
      name: 'Unique ID',
      schema: string().required(),
    },
  },
  relatedTables: {
    additionalInformation: {
      name: 'Additional Information',
      schema: string().nullable(),
    },
    additionalInformationLinkFields: {
      name: 'Additional Information Link Fields',
      schema: string().nullable(),
    },
    featureService: {
      name: 'Feature Service',
      schema: string().nullable(),
    },
    fields: {
      name: 'Fields',
      schema: string().nullable(),
    },
    oidField: {
      name: 'OID Field',
      schema: string().nullable(),
    },
    sgidTableName: {
      name: 'SGID Table Name',
      schema: string().nullable(),
    },
    tabName: {
      name: 'Tab Name',
      schema: string().nullable(),
    },
  },
};

function getFieldNames(fieldConfigs) {
  return Object.keys(fieldConfigs).reduce((obj, key) => {
    obj[key] = fieldConfigs[key].name;

    return obj;
  }, {});
}

function getFieldKeys(fieldConfigs) {
  return Object.keys(fieldConfigs).reduce((obj, key) => {
    obj[fieldConfigs[key].name] = key;

    return obj;
  }, {});
}

export const fieldNames = {
  queryLayers: getFieldNames(fieldConfigs.queryLayers),
  relatedTables: getFieldNames(fieldConfigs.relatedTables),
};

export const fieldKeys = {
  queryLayers: getFieldKeys(fieldConfigs.queryLayers),
  relatedTables: getFieldKeys(fieldConfigs.relatedTables),
};

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

export const downloadFormats = {
  csv: 'csv',
  excel: 'excel',
  filegdb: 'filegdb',
  geojson: 'geojson',
  geoPackage: 'geoPackage',
  shapefile: 'shapefile',
  sqlite: 'sqlite',
};
