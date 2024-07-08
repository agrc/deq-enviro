export default {
  symbols: {
    filter: {
      type: 'simple-fill',
      style: 'solid',
      color: 'rgba(255, 255, 0, 0.15)',
      outline: { color: 'rgb(255, 255, 0)' },
    },
    point: {
      type: 'simple',
      symbol: {
        type: 'simple-marker',
        style: 'circle',
        color: null, // to be filled in later
        size: 8,
        outline: {
          color: 'rgba(0, 0, 0, 255)',
          width: 1,
        },
      },
    },
    polygon: {
      type: 'simple',
      symbol: {
        type: 'simple-fill',
        style: 'solid',
        color: null, // to be filled in later
        outline: {
          color: 'rgba(0, 0, 0, 255)',
          width: 0.4,
        },
      },
    },
    defaultColors: [
      'rgb(31, 120, 180)',
      'rgb(51, 160, 44)',
      'rgb(227, 26, 28)',
      'rgb(255, 127, 0)',
      'rgb(106, 61, 154)',
      'rgb(253, 191, 111)',
      'rgb(251, 154, 153)',
      'rgb(178, 223, 138)',
      'rgb(166, 206, 227)',
      'rgb(202, 178, 214)',
      'rgb(255, 255, 153)',
      'rgb(177, 89, 40)',
    ],
    defaultOpacity: 0.65,
  },
  urls: {
    masquerade:
      'https://masquerade.ugrc.utah.gov/arcgis/rest/services/UtahLocator/GeocodeServer',
    print:
      'https://print.ugrc.utah.gov/v2/14/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
    utahPLSS:
      'https://tiles.arcgis.com/tiles/99lidPhWCzftIe9K/arcgis/rest/services/UtahPLSS/VectorTileServer',
    landOwnership:
      'https://gis.trustlands.utah.gov/hosting/rest/services/Hosted/Land_Ownership_WM_VectorTile/VectorTileServer',
    parcels:
      'https://tiles.arcgis.com/tiles/99lidPhWCzftIe9K/arcgis/rest/services/StatewideParcels/VectorTileServer',

    // AGOL Item: https://utahdeq.maps.arcgis.com/home/item.html?id=24c7e34093d24563ba360fa46f67317b
    environmentalCovenants:
      'https://services2.arcgis.com/NnxP4LZ3zX8wWmP9/ArcGIS/rest/services/Utah_DEQ_Environmental_Covenants/FeatureServer/0',
    HUC8: 'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/Utah_HUC_Boundaries/FeatureServer/0',
    streams:
      'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahStreamsNHD/FeatureServer/0',
  },
  maxSearchCount: 30_000,
  minLabelScale: 250_000,
};
