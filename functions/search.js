import knex from 'knex';

const db = knex({
  client: 'pg',
  connection: {
    host: 'opensgid.agrc.utah.gov',
    user: 'agrc',
    password: 'agrc',
    database: 'opensgid',
    port: 5432,
  },
});

export async function search(text) {
  const features = await db('water.streams_nhd as nhd')
    .join(
      'boundaries.county_boundaries as county',
      db.raw('ST_INTERSECTS(nhd.shape, county.shape)')
    )
    .distinct('nhd.gnis_name', 'county.name as county_name')
    .whereILike('nhd.gnis_name', `${text}%`);

  return {
    items: features.map((feature) => {
      return { attributes: feature };
    }),
  };
}

export async function getFeature(match, context) {
  const feature = await db('water.streams_nhd as nhd')
    .join(
      'boundaries.county_boundaries as county',
      db.raw('ST_Intersects(nhd.shape, county.shape)')
    )
    .first(
      'nhd.gnis_name',
      'county.name as county_name',
      db.raw('ST_AsGeoJSON(ST_Union(nhd.shape)) as shape')
    )
    .groupBy('nhd.gnis_name', 'county.name')
    .where({
      'nhd.gnis_name': match,
      'county.name': context,
    });

  const geoJson = JSON.parse(feature.shape);

  return {
    feature: {
      attributes: {
        gnis_name: feature.gnis_name,
        county_name: feature.county_name,
      },
      geometry: {
        paths: geoJson.coordinates,
        type: 'polyline',
        spatialReference: {
          wkid: 26912,
        },
      },
    },
  };
}
