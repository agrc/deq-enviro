import { describe, expect, it } from 'vitest';
import { fieldNames } from '../../../../functions/common/config';
import { getWhere, validate } from './utils';

describe('validate', () => {
  it('returns null if the value is within the range', () => {
    expect(validate('5', 0, 10)).toBeNull();
  });
  it('returns an error message if the value is outside the range', () => {
    expect(validate('15', 0, 10)).toMatchInlineSnapshot(
      '"Value must be between 0 and 10."',
    );
    expect(validate('-1', 0, 10)).toMatchInlineSnapshot(
      '"Value must be between 0 and 10."',
    );
  });
  it('returns null if the value is empty', () => {
    expect(validate('', 0, 10)).toBeNull();
  });
});

describe('getWhere', () => {
  const fields = [
    {
      name: 'NAME',
      type: 'esriFieldTypeString',
    },
    {
      name: 'ID',
      type: 'esriFieldTypeInteger',
    },
  ];

  /** @type {import('../../../../functions/common/config').QueryLayerConfig} */
  const layerConfig = {
    'Table Name': '',
    'Layer Name': '',
    'Geometry Type': '',
    'Division Heading': '',
    'Layer Description': '',
    'Metadata Link': '',
    'Special Filters': [],
    'Special Filter Default To On': false,
    'Additional Searches': '',
    'OID Field': '',
    ID: '',
    NAME: '',
    'Custom Symbology Field': '',
    'Legend Title': '',
    'Map Label Field': '',
    'Sort Field': '',
    'Related Tables': '',
    'Result Grid Fields': [],
    'Document Search': '',
    'GRAMA Request': '',
    'Permit Information': '',
    'Additional Information': '',
    Comments: '',
    'Feature Service': '',
    'Coded Values': '',
    'Identify Fields': [],
  };
  it('returns null if attributeFilterConfig is empty', () => {
    expect(
      getWhere(
        null,
        {
          ...layerConfig,
          [fieldNames.queryLayers.nameField]: 'NAME',
        },
        fields,
      ),
    ).toBeNull();
  });
  it('returns a where clause for a single value', () => {
    expect(
      getWhere(
        {
          values: ['foo'],
          queryType: 'all',
          attributeType: 'name',
        },
        {
          ...layerConfig,
          [fieldNames.queryLayers.nameField]: 'NAME',
        },
        fields,
      ),
    ).toMatchInlineSnapshot('"upper(NAME) LIKE upper(\'%foo%\')"');
  });
  it('returns a where clause for the all query type', () => {
    expect(
      getWhere(
        {
          values: ['foo', 'bar'],
          queryType: 'all',
          attributeType: 'name',
        },
        {
          ...layerConfig,
          [fieldNames.queryLayers.nameField]: 'NAME',
        },
        fields,
      ),
    ).toMatchInlineSnapshot(
      "\"upper(NAME) LIKE upper('%foo%') AND upper(NAME) LIKE upper('%bar%')\"",
    );
  });
  it('returns a where clause for the any query type', () => {
    expect(
      getWhere(
        {
          values: ['foo', 'bar'],
          queryType: 'any',
          attributeType: 'name',
        },
        {
          ...layerConfig,
          [fieldNames.queryLayers.nameField]: 'NAME',
        },
        fields,
      ),
    ).toMatchInlineSnapshot(
      "\"upper(NAME) LIKE upper('%foo%') OR upper(NAME) LIKE upper('%bar%')\"",
    );
  });
  it('handles numeric field types', () => {
    expect(
      getWhere(
        {
          values: [1, 2],
          queryType: 'any',
          attributeType: 'id',
        },
        {
          ...layerConfig,
          [fieldNames.queryLayers.idField]: 'ID',
        },
        fields,
      ),
    ).toMatchInlineSnapshot('"ID in (1, 2)"');
  });
  it('throws an error if the field is not found', () => {
    expect(() =>
      getWhere(
        {
          values: ['foo'],
          queryType: 'all',
          attributeType: 'name',
        },
        {
          ...layerConfig,
          [fieldNames.queryLayers.nameField]: 'NAME',
        },
        [],
      ),
    ).toThrowErrorMatchingInlineSnapshot(`[Error: Field NAME not found in fields.]`);
  });
  it('throws if the field type is not supported', () => {
    expect(() =>
      getWhere(
        {
          values: ['foo'],
          queryType: 'all',
          attributeType: 'name',
        },
        {
          ...layerConfig,
          [fieldNames.queryLayers.nameField]: 'NAME',
        },
        [
          {
            name: 'NAME',
            type: 'esriFieldTypeBlob',
          },
        ],
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: Field type esriFieldTypeBlob is not supported.]`,
    );
  });
});
