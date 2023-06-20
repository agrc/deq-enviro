import { describe, expect, it } from 'vitest';
import { validate } from './utils';

describe('validate', () => {
  it('returns null if the value is within the range', () => {
    expect(validate('5', 0, 10)).toBeNull();
  });
  it('returns an error message if the value is outside the range', () => {
    expect(validate('15', 0, 10)).toMatchInlineSnapshot(
      '"Value must be between 0 and 10."'
    );
    expect(validate('-1', 0, 10)).toMatchInlineSnapshot(
      '"Value must be between 0 and 10."'
    );
  });
  it('returns null if the value is empty', () => {
    expect(validate('', 0, 10)).toBeNull();
  });
});
