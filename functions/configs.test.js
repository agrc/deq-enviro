import { describe, expect, it } from 'vitest';
import { fieldKeys } from './common/config';
import {
  nestRelationships,
  applyTransforms,
  arraysToObjects,
  checkForDuplicateTableNames,
  validateFields,
  getFieldsFromUrl,
  getFieldsFromSpecialFilters,
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

describe('checkForDuplicateNames', () => {
  it('throws an error if there are duplicate ids', () => {
    const configs = [
      { 'Table Name': 'one' },
      { 'Table Name': 'two' },
      { 'Table Name': 'one' },
    ];
    expect(() => checkForDuplicateTableNames(configs)).toThrow();
  });

  it('does not throw an error if there are no duplicate ids', () => {
    const configs = [
      { 'Table Name': 'one' },
      { 'Table Name': 'two' },
      { 'Table Name': 'three' },
    ];
    expect(() => checkForDuplicateTableNames(configs)).not.toThrow();
  });
});

describe('applyTransforms', () => {
  it('applies transforms to configs', () => {
    const configs = [
      {
        'Table Name': 'one',
        'Result Grid Fields': 'one',
      },
      {
        'Table Name': 'two',
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
        'Table Name': 'one',
        'Result Grid Fields': 'ONE',
      },
      {
        'Table Name': 'two',
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
    'Table Name': 'one',
    'Result Grid Fields': ['one', 'two', 'three'],
    'ID Field': 'one',
    'Layer Name': 'Test Layer',
  };
  const tableName = 'Test Layer';
  it('returns an error message if there is a missing field', () => {
    const fieldValidation = 'Result Grid Fields';
    const serviceFieldNames = ['one'];

    expect(
      // @ts-expect-error
      validateFields(fieldValidation, serviceFieldNames, config, tableName),
    ).toMatchInlineSnapshot(`
      [
        "Test Layer: field "two" in "Result Grid Fields" is not a valid field name.",
        "Test Layer: field "three" in "Result Grid Fields" is not a valid field name.",
      ]
    `);
  });
  it('returns true if field is valid', () => {
    const fieldValidation = 'ID Field';
    const serviceFieldNames = ['one'];

    expect(
      // @ts-expect-error
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
      // @ts-expect-error
      validateFields(fieldValidation, serviceFieldNames, config, tableName),
    ).toBe(true);
  });
  it('returns true if config value is empty', () => {
    const fieldValidation = 'Empty';
    const serviceFieldNames = ['one'];

    expect(
      // @ts-expect-error
      validateFields(fieldValidation, serviceFieldNames, config, tableName),
    ).toBe(true);

    const fieldValidation2 = {
      configProp: 'Empty',
      getFieldNames: () => undefined,
    };

    expect(
      // @ts-expect-error
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

describe('getFieldsFromSpecialFilters', () => {
  it('handles all of the different filter config types', () => {
    /**
     * @type {(
     *   | import('./configs').FieldFilterConfig
     *   | import('./common/config').CheckboxRadioQueriesFilterConfig
     *   | import('./configs').DateFilterConfig
     * )[]}
     */
    const configs = [
      {
        type: 'field',
        field: 'FieldField',
        fieldType: 'text',
        label: 'Field Field',
        options: [],
      },
      {
        type: 'radio',
        options: [],
      },
      {
        type: 'checkbox',
        options: [],
      },
      {
        type: 'date',
        field: 'DateField',
        label: 'Date Field',
      },
    ];

    const expected = ['FieldField', 'DateField'];

    expect(getFieldsFromSpecialFilters(configs)).toEqual(expected);
  });
});

describe('nestRelationships', () => {
  it('nests relationships', () => {
    /** @type {import('./common/config').RelationshipClassConfig[]} */
    const input = [
      {
        'Parent Dataset Name': 'Parent',
        'Primary Key': 'Test',
        'Related Table Name': 'Child',
        'Foreign Key': 'Test',
      },
      {
        'Parent Dataset Name': 'Child 2',
        'Primary Key': 'Test',
        'Related Table Name': 'Grandchild 1',
        'Foreign Key': 'Test',
      },
      {
        'Parent Dataset Name': 'Parent',
        'Primary Key': 'Test',
        'Related Table Name': 'Child 2',
        'Foreign Key': 'Test',
      },
      {
        'Parent Dataset Name': 'Parent 2',
        'Primary Key': 'Test',
        'Related Table Name': 'Child 3',
        'Foreign Key': 'Test',
      },
      {
        'Parent Dataset Name': 'Child 3',
        'Primary Key': 'Test',
        'Related Table Name': 'Grandchild 2',
        'Foreign Key': 'Test',
      },
    ];

    expect(nestRelationships(input)).toEqual([
      {
        'Parent Dataset Name': 'Parent',
        'Primary Key': 'Test',
        'Related Table Name': 'Child',
        'Foreign Key': 'Test',
      },
      {
        'Parent Dataset Name': 'Parent',
        'Primary Key': 'Test',
        'Related Table Name': 'Child 2',
        'Foreign Key': 'Test',
        nestedRelationships: [
          {
            'Parent Dataset Name': 'Child 2',
            'Primary Key': 'Test',
            'Related Table Name': 'Grandchild 1',
            'Foreign Key': 'Test',
          },
        ],
      },
      {
        'Parent Dataset Name': 'Parent 2',
        'Primary Key': 'Test',
        'Related Table Name': 'Child 3',
        'Foreign Key': 'Test',
        nestedRelationships: [
          {
            'Parent Dataset Name': 'Child 3',
            'Primary Key': 'Test',
            'Related Table Name': 'Grandchild 2',
            'Foreign Key': 'Test',
          },
        ],
      },
    ]);
  });
});
