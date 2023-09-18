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
  it('returns null if attributeFilterConfig is empty', () => {
    expect(getWhere(null, {})).toBeNull();
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
          [fieldNames.queryLayers.nameField]: 'NAME',
        },
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
          [fieldNames.queryLayers.nameField]: 'NAME',
        },
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
          [fieldNames.queryLayers.nameField]: 'NAME',
        },
      ),
    ).toMatchInlineSnapshot(
      "\"upper(NAME) LIKE upper('%foo%') OR upper(NAME) LIKE upper('%bar%')\"",
    );
  });
});
