import { describe, expect, it } from 'vitest';
import { fieldKeys } from './common/config';
import {
  applyTransforms,
  arraysToObjects,
  checkForDuplicateIds,
  validateFields,
  getFieldsFromUrl,
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
      applyTransforms(configs, fieldConfigs, fieldKeys.queryLayers),
    ).toEqual(expected);
  });
});

describe('validateFields', () => {
  const config = {
    'Unique ID': 'one',
    'Result Grid Fields': ['one', 'two', 'three'],
    'ID Field': 'one',
    'Layer Name': 'Test Layer',
  };
  const tableName = 'Test Layer';
  it('returns an error message if there is a missing field', () => {
    const fieldValidation = 'Result Grid Fields';
    const serviceFieldNames = ['one'];

    expect(
      validateFields(fieldValidation, serviceFieldNames, config, tableName),
    ).toMatchInlineSnapshot(`
        [
          "Test Layer: field \\"two\\" in \\"Result Grid Fields\\" is not a valid field name.",
          "Test Layer: field \\"three\\" in \\"Result Grid Fields\\" is not a valid field name.",
        ]
      `);
  });
  it('returns true if field is valid', () => {
    const fieldValidation = 'ID Field';
    const serviceFieldNames = ['one'];

    expect(
      validateFields(fieldValidation, serviceFieldNames, config, tableName),
    ).toBe(true);
  });
  it('handles a getter function', () => {
    const fieldValidation = {
      configProp: 'Result Grid Fields',
      getFieldNames: (value) => value,
    };
    const serviceFieldNames = ['one', 'two', 'three'];

    expect(
      validateFields(fieldValidation, serviceFieldNames, config, tableName),
    ).toBe(true);
  });
  it('returns true if config value is empty', () => {
    const fieldValidation = 'Empty';
    const serviceFieldNames = ['one'];

    expect(
      validateFields(fieldValidation, serviceFieldNames, config, tableName),
    ).toBe(true);

    const fieldValidation2 = {
      configProp: 'Empty',
      getFieldNames: () => undefined,
    };

    expect(
      validateFields(fieldValidation2, serviceFieldNames, config, tableName),
    ).toBe(true);
  });
});

describe('getFieldsFromUrl', () => {
  it('returns an array of field names', () => {
    const urls = 'https://test.com?test={one}&hello={two}&blah={three}';
    const expected = ['one', 'two', 'three'];

    expect(getFieldsFromUrl(urls)).toEqual(expected);
  });
  it('returns an empty array for undefined', () => {
    expect(getFieldsFromUrl()).toEqual([]);
  });
  it('returns an empty array if there are no template strings', () => {
    const urls = 'https://test.com';

    expect(getFieldsFromUrl(urls)).toEqual([]);
  });
});
