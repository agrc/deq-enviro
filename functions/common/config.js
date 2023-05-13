import { object, string } from 'yup';

const fields = {
  queryLayers: {
    additionalInformation: {
      name: 'Additional Information',
      schema: string().url().nullable(),
    },
    additionalSearches: {
      name: 'Additional Searches',
      schema: string().nullable(),
    },
    addressField: {
      name: 'ADDRESS',
      schema: string().nullable(),
    },
    cityField: {
      name: 'CITY',
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
      schema: string().url().nullable(),
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
    idField: {
      name: 'ID',
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
    nameField: {
      name: 'NAME',
      schema: string().nullable(),
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
    typeField: {
      name: 'TYPE',
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

export const fieldNames = {
  queryLayers: getFieldNames(fields.queryLayers),
  relatedTables: getFieldNames(fields.relatedTables),
};

function getSchema(fieldConfigs) {
  return Object.keys(fieldConfigs).reduce((obj, key) => {
    obj[fieldConfigs[key].name] = fieldConfigs[key].schema;

    return obj;
  }, {});
}

export const schemas = {
  queryLayers: object(getSchema(fields.queryLayers)),
  relatedTables: object(getSchema(fields.relatedTables)),
};

export default {
  fieldNames,
  links: {
    training: {
      url: 'https://deq.utah.gov/general/training-videos-interactive-map',
      description: 'Training Videos',
    },
  },
  schemas,
};
