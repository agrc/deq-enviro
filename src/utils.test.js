import { describe, expect, it } from 'vitest';
import { getAlias, hasDefaultSymbology } from './utils';

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
