import { describe, expect, it } from 'vitest';
import { transformFields } from './config';

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
