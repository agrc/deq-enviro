import { describe, expect, it } from 'vitest';
import { arraysToObjects } from './update';

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
});
