import { describe, expect, it } from 'vitest';
import { fieldKeys } from './common/config';
import {
  applyTransforms,
  arraysToObjects,
  checkForDuplicateIds,
} from './configs';

describe('arraysToObjects', () => {
  it('converts an array of arrays to an array of objects', () => {
    const arrays = [
      ['name', 'age'],
      ['John', 30],
      ['Mary', 25],
    ];
    const objects = [
      { name: 'John', age: 30 },
      { name: 'Mary', age: 25 },
    ];
    expect(arraysToObjects(arrays)).toEqual(objects);
  });

  it('skips fields', () => {
    const arrays = [
      ['name', 'skip', 'age'],
      ['John', 99, 30],
      ['Mary', 88, 25],
    ];
    const objects = [
      { name: 'John', age: 30 },
      { name: 'Mary', age: 25 },
    ];
    expect(arraysToObjects(arrays, ['skip'])).toEqual(objects);
  });

  it('converts empty strings to null', () => {
    const arrays = [
      ['name', 'age'],
      ['John', ''],
      ['Mary', ''],
    ];
    const objects = [
      { name: 'John', age: null },
      { name: 'Mary', age: null },
    ];
    expect(arraysToObjects(arrays)).toEqual(objects);
  });
});

describe('checkForDuplicateIds', () => {
  it('throws an error if there are duplicate ids', () => {
    const configs = [
      { 'Unique ID': 'one' },
      { 'Unique ID': 'two' },
      { 'Unique ID': 'one' },
    ];
    expect(() => checkForDuplicateIds(configs)).toThrow();
  });

  it('does not throw an error if there are no duplicate ids', () => {
    const configs = [
      { 'Unique ID': 'one' },
      { 'Unique ID': 'two' },
      { 'Unique ID': 'three' },
    ];
    expect(() => checkForDuplicateIds(configs)).not.toThrow();
  });
});

describe('applyTransforms', () => {
  it('applies transforms to configs', () => {
    const configs = [
      {
        'Unique ID': 'one',
        'Result Grid Fields': 'one',
      },
      {
        'Unique ID': 'two',
        'Result Grid Fields': 'four',
      },
    ];

    const fieldConfigs = {
      resultGridFields: {
        transform: (value) => value.toUpperCase(),
      },
    };

    const expected = [
      {
        'Unique ID': 'one',
        'Result Grid Fields': 'ONE',
      },
      {
        'Unique ID': 'two',
        'Result Grid Fields': 'FOUR',
      },
    ];

    expect(
      applyTransforms(configs, fieldConfigs, fieldKeys.queryLayers)
    ).toEqual(expected);
  });
});
