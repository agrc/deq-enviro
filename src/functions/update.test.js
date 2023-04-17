import { describe, expect, it } from 'vitest';
import { fieldNames } from '../config';
import { addFeatureServices, arraysToObjects, getLinksConfig } from './update';

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

describe('addFeatureServices', () => {
  it('adds feature service URLs to configs', () => {
    const configs = [
      {
        [fieldNames.queryLayers.sgidFeatureClassName]:
          'SGID10.BOUNDARIES.Counties',
      },
      {
        [fieldNames.queryLayers.sgidFeatureClassName]:
          'SGID10.BOUNDARIES.SomethingElse',
      },
    ];
    const featureServices = {
      Counties: 'counties url',
      SomethingElse: 'something else url',
    };

    const expected = [
      {
        [fieldNames.queryLayers.sgidFeatureClassName]:
          'SGID10.BOUNDARIES.Counties',
        featureService: 'counties url',
      },
      {
        [fieldNames.queryLayers.sgidFeatureClassName]:
          'SGID10.BOUNDARIES.SomethingElse',
        featureService: 'something else url',
      },
    ];

    expect(
      addFeatureServices(
        configs,
        featureServices,
        fieldNames.queryLayers.sgidFeatureClassName
      )
    ).toEqual(expected);
  });
});

describe('getLinksConfig', () => {
  it('gets the links config', () => {
    const values = [
      [fieldNames.links.id, fieldNames.links.description, fieldNames.links.url],
      ['1', 'description 1', 'url 1'],
    ];
    const expected = {
      1: {
        description: 'description 1',
        url: 'url 1',
      },
    };

    expect(getLinksConfig(values)).toEqual(expected);
  });
});
