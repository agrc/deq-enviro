import { describe, expect, it } from 'vitest';
import {
  transformAdditionalSearches,
  transformFields,
  transformSpecialFilters,
  transformYesNoToBoolean,
} from './config';

describe('transformYesNoToBoolean', () => {
  it('handles Yes', () => {
    expect(transformYesNoToBoolean('Y')).toBe(true);
  });

  it('handles No', () => {
    expect(transformYesNoToBoolean('N')).toBe(false);
  });

  it('handles undefined', () => {
    expect(transformYesNoToBoolean(undefined)).toBe(false);
  });
});

describe('transformSpecialFilters', () => {
  it('parses a field value filter', () => {
    const value =
      'field: ProtZone|number (Protection Zone), 1 (Zone 1), 2 (Zone 2), 3 (Zone 3), 4 (Zone 4)';

    expect(transformSpecialFilters(value)).toEqual([
      {
        type: 'field',
        field: 'ProtZone',
        fieldType: 'number',
        label: 'Protection Zone',
        options: [
          {
            value: '1',
            alias: 'Zone 1',
          },
          {
            value: '2',
            alias: 'Zone 2',
          },
          {
            value: '3',
            alias: 'Zone 3',
          },
          {
            value: '4',
            alias: 'Zone 4',
          },
        ],
      },
    ]);
  });

  it('throws on invalid field type', () => {
    const value = 'field: ProtZone|foo (Protection Zone)';

    expect(() =>
      transformSpecialFilters(value),
    ).toThrowErrorMatchingInlineSnapshot(`[Error: Invalid field type: foo]`);
  });

  it('parses checkbox and radio filters', () => {
    const value =
      "checkbox: ASSESSMENT = '1: Supports all designated uses' (1: Supports all designated uses), ASSESSMENT = '2: Supports all assessed uses' (2: Supports all assessed uses)";

    expect(transformSpecialFilters(value)).toEqual([
      {
        type: 'checkbox',
        options: [
          {
            value: "ASSESSMENT = '1: Supports all designated uses'",
            alias: '1: Supports all designated uses',
          },
          {
            value: "ASSESSMENT = '2: Supports all assessed uses'",
            alias: '2: Supports all assessed uses',
          },
        ],
      },
    ]);

    const value2 =
      "radio: ASSESSMENT = '1: Supports all designated uses' (1: Supports all designated uses), ASSESSMENT = '2: Supports all assessed uses' (2: Supports all assessed uses)";

    expect(transformSpecialFilters(value2)).toEqual([
      {
        type: 'radio',
        options: [
          {
            value: "ASSESSMENT = '1: Supports all designated uses'",
            alias: '1: Supports all designated uses',
          },
          {
            value: "ASSESSMENT = '2: Supports all assessed uses'",
            alias: '2: Supports all assessed uses',
          },
        ],
      },
    ]);
  });

  it('parses a date filter', () => {
    const value = 'date: Date_Discovered_For_Filter (Date Discovered)';

    expect(transformSpecialFilters(value)).toEqual([
      {
        type: 'date',
        field: 'Date_Discovered_For_Filter',
        label: 'Date Discovered',
      },
    ]);
  });

  it('parses multiple filters', () => {
    const value =
      "radio: TANK = '1' (Has UST(s)), TANK = '1' and OPENTANK = '0' (Tank Status UST: Closed), OPENTANK = '1' (Tank Status UST: Open); radio: REGAST = '1' (Has State Regulated AST(s)), REGAST = '1' and OPENREGAST = '0' (Tank Status AST: Closed), OPENREGAST = '1' (Tank Status AST: Open); radio: RELEASE = '1' (Has Release(s)), RELEASE = '1' and OPENRELEASE = '0' (Has Closed Release(s)), OPENRELEASE = '1' (Has Open Release(s)); radio: FACTSHEET = '1' (Land Reuse Initiative)";

    expect(transformSpecialFilters(value)).toEqual([
      {
        type: 'radio',
        options: [
          {
            value: "TANK = '1'",
            alias: 'Has UST(s)',
          },
          {
            value: "TANK = '1' and OPENTANK = '0'",
            alias: 'Tank Status UST: Closed',
          },
          {
            value: "OPENTANK = '1'",
            alias: 'Tank Status UST: Open',
          },
        ],
      },
      {
        type: 'radio',
        options: [
          {
            value: "REGAST = '1'",
            alias: 'Has State Regulated AST(s)',
          },
          {
            value: "REGAST = '1' and OPENREGAST = '0'",
            alias: 'Tank Status AST: Closed',
          },
          {
            value: "OPENREGAST = '1'",
            alias: 'Tank Status AST: Open',
          },
        ],
      },
      {
        type: 'radio',
        options: [
          {
            value: "RELEASE = '1'",
            alias: 'Has Release(s)',
          },
          {
            value: "RELEASE = '1' and OPENRELEASE = '0'",
            alias: 'Has Closed Release(s)',
          },
          {
            value: "OPENRELEASE = '1'",
            alias: 'Has Open Release(s)',
          },
        ],
      },
      {
        type: 'radio',
        options: [
          {
            value: "FACTSHEET = '1'",
            alias: 'Land Reuse Initiative',
          },
        ],
      },
    ]);
  });

  it('throws on invalid field type', () => {
    const value = 'foo: bar';

    expect(() =>
      transformSpecialFilters(value),
    ).toThrowErrorMatchingInlineSnapshot(`[Error: Invalid filter type: foo]`);
  });

  it('returns an empty array if no filters are provided', () => {
    const value = '';

    expect(transformSpecialFilters(value)).toEqual([]);
  });
});

describe('transformFields', () => {
  it('handles a list of plain fields without aliases', () => {
    const config = 'one, two,three';

    expect(transformFields(config)).toEqual(['one', 'two', 'three']);
  });

  it('handles a list of fields with aliases', () => {
    const config = 'one (1), two (2),three (3)';

    expect(transformFields(config)).toEqual([
      {
        name: 'one',
        alias: '1',
      },
      {
        name: 'two',
        alias: '2',
      },
      {
        name: 'three',
        alias: '3',
      },
    ]);
  });

  it('handles nested parentheses in aliases', () => {
    const config = 'one (1), two (2),three (3 (three))';

    expect(transformFields(config)).toEqual([
      {
        name: 'one',
        alias: '1',
      },
      {
        name: 'two',
        alias: '2',
      },
      {
        name: 'three',
        alias: '3 (three)',
      },
    ]);
  });
});

describe('transformAdditionalSearches', () => {
  it('parses a list of additional searches', () => {
    const value = 'Operator|text (Operator Name); FieldName|text (Field Name)';

    expect(transformAdditionalSearches(value)).toEqual([
      {
        field: 'Operator',
        fieldType: 'text',
        label: 'Operator Name',
      },
      {
        field: 'FieldName',
        fieldType: 'text',
        label: 'Field Name',
      },
    ]);
  });

  it('returns an empty array if no filters are provided', () => {
    const value = '';

    expect(transformAdditionalSearches(value)).toEqual([]);
  });
});
