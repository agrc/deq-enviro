import { describe, expect, it } from 'vitest';
import { getAlias } from './utils';

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
