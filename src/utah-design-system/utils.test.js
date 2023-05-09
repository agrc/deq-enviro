import { describe, expect, it } from 'vitest';
import { createKeyLookup } from './utils';

describe('createKeyLookup', () => {
  it('should return an object with keys equal to values', () => {
    const object = {
      key1: 'value1',
      key2: 'value2',
    };
    const result = createKeyLookup(object);
    const expected = {
      key1: 'key1',
      key2: 'key2',
    };

    expect(result).toEqual(expected);
  });
});
