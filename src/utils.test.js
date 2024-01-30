import { describe, expect, it } from 'vitest';
import {
  getDefQueryFromLayerFilterValues,
  getAlias,
  hasDefaultSymbology,
  getDefaultLayerFilterValues,
} from './utils';
import queryLayerJson from '../tests/fixtures/queryLayerResult.json';

describe('getAlias', () => {
  it('returns the alias if the field exists', () => {
    const fields = [
      { name: 'field1', alias: 'Field 1' },
      { name: 'field2', alias: 'Field 2' },
    ];
    const result = getAlias('field1', fields);
    const expected = 'Field 1';

    expect(result).toEqual(expected);
  });

  it('returns the field name if there is no alias', () => {
    const fields = [{ name: 'field1' }, { name: 'field2' }];
    const result = getAlias('field1', fields);
    const expected = 'field1';

    expect(result).toEqual(expected);
  });

  it('returns the field name if there are no fields defined', () => {
    expect(getAlias('field1', undefined)).toEqual('field1');
  });
});

describe('hasDefaultSymbology', () => {
  it('returns true if the layer is a point layer with default simple symbology', () => {
    const layer = {
      geometryType: 'point',
      renderer: {
        type: 'simple',
        symbol: {
          size: 4,
        },
      },
    };

    expect(hasDefaultSymbology(layer)).toEqual(true);

    layer.renderer.type = 'unique-value';

    expect(hasDefaultSymbology(layer)).toEqual(false);
  });
  it('checks polygon layers', () => {
    const layer = {
      geometryType: 'polygon',
      renderer: {
        type: 'simple',
        symbol: {
          outline: {
            width: 0.7,
          },
        },
      },
    };

    expect(hasDefaultSymbology(layer)).toEqual(true);

    layer.renderer.symbol.outline.width = 0.8;

    expect(hasDefaultSymbology(layer)).toEqual(false);
  });
});

describe('getDefQueryFromLayerFilterValues', () => {
  it('returns a query string', () => {
    /** @type {import('./contexts/SearchMachineProvider').LayerFilterValue[]} */
    const values = [
      {
        type: 'field',
        field: 'FieldName',
        fieldType: 'text',
        values: ['Value1', 'Value2'],
      },
      {
        type: 'field',
        field: 'FieldName',
        fieldType: 'number',
        values: ['1', '2'],
      },
      {
        type: 'checkbox',
        values: ["Field = 'Value1'", "Field = 'Value2'"],
      },
      {
        type: 'radio',
        values: ["Field = 'Value1'"],
      },
      {
        type: 'date',
        field: 'FieldName',
        values: ['2020-01-01', '2020-01-02'],
      },
    ];

    const result = getDefQueryFromLayerFilterValues(values);

    expect(result).toEqual(
      "FieldName IN ('Value1','Value2') AND FieldName IN (1,2) AND ((Field = 'Value1') OR (Field = 'Value2')) AND Field = 'Value1' AND FieldName >= '2020-01-01' AND FieldName <= '2020-01-02'",
    );
  });

  it('returns null if there are no values', () => {
    expect(getDefQueryFromLayerFilterValues([])).toEqual(null);
    expect(getDefQueryFromLayerFilterValues(undefined)).toEqual(null);
  });
});

describe('getDefaultLayerFilterValues', () => {
  it('returns the default values', () => {
    /** @type {import('../functions/common/config').QueryLayerConfig[]} */
    const queryLayers = [
      {
        ...queryLayerJson,
        'Table Name': 'Table Name',
        'Special Filters': [
          {
            type: 'checkbox',
            options: [
              {
                value: 'Option 1',
                alias: 'Option One',
              },
              { value: 'Option 2', alias: 'Option Two' },
            ],
          },
        ],
        'Special Filter Default To On': false,
      },
      {
        ...queryLayerJson,
        'Table Name': 'Table Name Two',
        'Special Filters': [
          {
            type: 'checkbox',
            options: [
              {
                value: 'Option 3',
                alias: 'Option One',
              },
              { value: 'Option 4', alias: 'Option Two' },
            ],
          },
        ],
        'Special Filter Default To On': true,
      },
    ];

    expect(getDefaultLayerFilterValues(queryLayers)).toEqual({
      'Table Name Two': [
        {
          type: 'checkbox',
          values: ['Option 3'],
        },
      ],
    });
  });
});
