import { fromJSON } from '@arcgis/core/renderers/support/jsonUtils';
import Legend from './Legend';

export default {
  title: 'Legend',
  component: Legend,
};

const brownFields = {
  type: 'simple',
  symbol: {
    type: 'simple-marker',
    color: [227, 26, 28, 255],
    size: 8,
    style: 'circle',
    outline: {
      type: 'simple-line',
      color: [0, 0, 0, 255],
      width: 1,
      style: 'solid',
    },
  },
};

const groundwater = fromJSON({
  authoringInfo: {
    colorRamp: {
      type: 'multipart',
      colorRamps: [
        {
          type: 'algorithmic',
          algorithm: 'esriCIELabAlgorithm',
          fromColor: [215, 210, 252, 255],
          toColor: [215, 210, 252, 255],
        },
        {
          type: 'algorithmic',
          algorithm: 'esriCIELabAlgorithm',
          fromColor: [189, 252, 184, 255],
          toColor: [189, 252, 184, 255],
        },
        {
          type: 'algorithmic',
          algorithm: 'esriCIELabAlgorithm',
          fromColor: [252, 206, 184, 255],
          toColor: [252, 206, 184, 255],
        },
        {
          type: 'algorithmic',
          algorithm: 'esriCIELabAlgorithm',
          fromColor: [179, 251, 252, 255],
          toColor: [179, 251, 252, 255],
        },
        {
          type: 'algorithmic',
          algorithm: 'esriCIELabAlgorithm',
          fromColor: [252, 248, 187, 255],
          toColor: [252, 248, 187, 255],
        },
        {
          type: 'algorithmic',
          algorithm: 'esriCIELabAlgorithm',
          fromColor: [250, 179, 252, 255],
          toColor: [250, 179, 252, 255],
        },
        {
          type: 'algorithmic',
          algorithm: 'esriCIELabAlgorithm',
          fromColor: [252, 194, 221, 255],
          toColor: [252, 194, 221, 255],
        },
        {
          type: 'algorithmic',
          algorithm: 'esriCIELabAlgorithm',
          fromColor: [215, 252, 218, 255],
          toColor: [215, 252, 218, 255],
        },
        {
          type: 'algorithmic',
          algorithm: 'esriCIELabAlgorithm',
          fromColor: [189, 224, 252, 255],
          toColor: [189, 224, 252, 255],
        },
        {
          type: 'algorithmic',
          algorithm: 'esriCIELabAlgorithm',
          fromColor: [199, 182, 252, 255],
          toColor: [199, 182, 252, 255],
        },
        {
          type: 'algorithmic',
          algorithm: 'esriCIELabAlgorithm',
          fromColor: [252, 237, 207, 255],
          toColor: [252, 237, 207, 255],
        },
        {
          type: 'algorithmic',
          algorithm: 'esriCIELabAlgorithm',
          fromColor: [248, 204, 252, 255],
          toColor: [248, 204, 252, 255],
        },
        {
          type: 'algorithmic',
          algorithm: 'esriCIELabAlgorithm',
          fromColor: [223, 252, 194, 255],
          toColor: [223, 252, 194, 255],
        },
      ],
    },
  },
  type: 'uniqueValue',
  field1: 'ProtZone',
  fieldDelimiter: ',',
  uniqueValueGroups: [
    {
      classes: [
        {
          label: '1',
          symbol: {
            type: 'CIMSymbolReference',
            symbol: {
              type: 'CIMPolygonSymbol',
              symbolLayers: [
                {
                  type: 'CIMSolidStroke',
                  enable: true,
                  capStyle: 'Round',
                  joinStyle: 'Round',
                  lineStyle3D: 'Strip',
                  miterLimit: 10,
                  width: 0.4,
                  color: [205, 206, 206, 255],
                },
                {
                  type: 'CIMSolidFill',
                  enable: true,
                  color: [255, 127, 127, 102],
                },
              ],
              angleAlignment: 'Map',
            },
          },
          values: [['1']],
        },
        {
          label: '2',
          symbol: {
            type: 'CIMSymbolReference',
            symbol: {
              type: 'CIMPolygonSymbol',
              symbolLayers: [
                {
                  type: 'CIMSolidStroke',
                  enable: true,
                  capStyle: 'Round',
                  joinStyle: 'Round',
                  lineStyle3D: 'Strip',
                  miterLimit: 10,
                  width: 0.7,
                  color: [110, 110, 110, 255],
                },
                {
                  type: 'CIMSolidFill',
                  enable: true,
                  color: [255, 235, 116, 128],
                },
              ],
              angleAlignment: 'Map',
            },
          },
          values: [['2']],
        },
        {
          label: '3',
          symbol: {
            type: 'CIMSymbolReference',
            symbol: {
              type: 'CIMPolygonSymbol',
              symbolLayers: [
                {
                  type: 'CIMSolidStroke',
                  enable: true,
                  capStyle: 'Round',
                  joinStyle: 'Round',
                  lineStyle3D: 'Strip',
                  miterLimit: 10,
                  width: 1,
                  color: [178, 178, 178, 255],
                },
                {
                  type: 'CIMSolidFill',
                  enable: true,
                  color: [255, 136, 0, 75],
                },
              ],
              angleAlignment: 'Map',
            },
          },
          values: [['3']],
        },
        {
          label: '4',
          symbol: {
            type: 'CIMSymbolReference',
            symbol: {
              type: 'CIMPolygonSymbol',
              symbolLayers: [
                {
                  type: 'CIMSolidStroke',
                  enable: true,
                  capStyle: 'Round',
                  joinStyle: 'Round',
                  lineStyle3D: 'Strip',
                  miterLimit: 10,
                  width: 1,
                  color: [178, 178, 178, 255],
                },
                {
                  type: 'CIMSolidFill',
                  enable: true,
                  color: [0, 0, 0, 26],
                },
              ],
              angleAlignment: 'Map',
            },
          },
          values: [['4']],
        },
      ],
    },
  ],
  uniqueValueInfos: [
    {
      label: '1',
      symbol: {
        type: 'CIMSymbolReference',
        symbol: {
          type: 'CIMPolygonSymbol',
          symbolLayers: [
            {
              type: 'CIMSolidStroke',
              enable: true,
              capStyle: 'Round',
              joinStyle: 'Round',
              lineStyle3D: 'Strip',
              miterLimit: 10,
              width: 0.4,
              color: [205, 206, 206, 255],
            },
            {
              type: 'CIMSolidFill',
              enable: true,
              color: [255, 127, 127, 102],
            },
          ],
          angleAlignment: 'Map',
        },
      },
      value: '1',
    },
    {
      label: '2',
      symbol: {
        type: 'CIMSymbolReference',
        symbol: {
          type: 'CIMPolygonSymbol',
          symbolLayers: [
            {
              type: 'CIMSolidStroke',
              enable: true,
              capStyle: 'Round',
              joinStyle: 'Round',
              lineStyle3D: 'Strip',
              miterLimit: 10,
              width: 0.7,
              color: [110, 110, 110, 255],
            },
            {
              type: 'CIMSolidFill',
              enable: true,
              color: [255, 235, 116, 128],
            },
          ],
          angleAlignment: 'Map',
        },
      },
      value: '2',
    },
    {
      label: '3',
      symbol: {
        type: 'CIMSymbolReference',
        symbol: {
          type: 'CIMPolygonSymbol',
          symbolLayers: [
            {
              type: 'CIMSolidStroke',
              enable: true,
              capStyle: 'Round',
              joinStyle: 'Round',
              lineStyle3D: 'Strip',
              miterLimit: 10,
              width: 1,
              color: [178, 178, 178, 255],
            },
            {
              type: 'CIMSolidFill',
              enable: true,
              color: [255, 136, 0, 75],
            },
          ],
          angleAlignment: 'Map',
        },
      },
      value: '3',
    },
    {
      label: '4',
      symbol: {
        type: 'CIMSymbolReference',
        symbol: {
          type: 'CIMPolygonSymbol',
          symbolLayers: [
            {
              type: 'CIMSolidStroke',
              enable: true,
              capStyle: 'Round',
              joinStyle: 'Round',
              lineStyle3D: 'Strip',
              miterLimit: 10,
              width: 1,
              color: [178, 178, 178, 255],
            },
            {
              type: 'CIMSolidFill',
              enable: true,
              color: [0, 0, 0, 26],
            },
          ],
          angleAlignment: 'Map',
        },
      },
      value: '4',
    },
  ],
});

const assessedLakes = {
  type: 'simple',
  symbol: {
    type: 'simple-marker',
    color: [255, 127, 0, 255],
    size: 8,
    style: 'circle',
    outline: {
      color: [0, 0, 0, 255],
      width: 1,
      style: 'solid',
      type: 'simple-line',
    },
  },
};

const huc = {
  type: 'simple',
  symbol: {
    type: 'simple-fill',
    color: [51, 160, 44, 255],
    outline: {
      type: 'simple-line',
      color: [0, 0, 0, 255],
      width: 0.4,
      style: 'solid',
    },
    style: 'solid',
  },
};

const classBreaks = fromJSON({
  authoringInfo: {
    classificationMethod: 'esriClassifyManual',
    colorRamp: {
      type: 'algorithmic',
      algorithm: 'esriHSVAlgorithm',
      fromColor: [245, 245, 0, 255],
      toColor: [245, 0, 0, 255],
    },
    type: 'classedColor',
  },
  type: 'classBreaks',
  classBreakInfos: [
    {
      label: 'less than 70th %ile',
      classMaxValue: 70,
      symbol: {
        type: 'esriSFS',
        color: [245, 245, 0, 0],
        outline: {
          type: 'esriSLS',
          color: [110, 110, 110, 255],
          width: 0.7,
          style: 'esriSLSSolid',
        },
        style: 'esriSFSSolid',
      },
    },
    {
      label: '70-80th %ile',
      classMaxValue: 80,
      symbol: {
        type: 'esriSFS',
        color: [130, 130, 130, 255],
        outline: {
          type: 'esriSLS',
          color: [110, 110, 110, 255],
          width: 0.7,
          style: 'esriSLSSolid',
        },
        style: 'esriSFSSolid',
      },
    },
    {
      label: '80-90th %ile',
      classMaxValue: 90,
      symbol: {
        type: 'esriSFS',
        color: [245, 122, 0, 255],
        outline: {
          type: 'esriSLS',
          color: [110, 110, 110, 255],
          width: 0.7,
          style: 'esriSLSSolid',
        },
        style: 'esriSFSSolid',
      },
    },
    {
      label: '90-95th %ile',
      classMaxValue: 95,
      symbol: {
        type: 'esriSFS',
        color: [245, 61, 0, 255],
        outline: {
          type: 'esriSLS',
          color: [110, 110, 110, 255],
          width: 0.7,
          style: 'esriSLSSolid',
        },
        style: 'esriSFSSolid',
      },
    },
    {
      label: '95-99th %ile',
      classMaxValue: 100,
      symbol: {
        type: 'esriSFS',
        color: [245, 0, 0, 255],
        outline: {
          type: 'esriSLS',
          color: [110, 110, 110, 255],
          width: 0.7,
          style: 'esriSLSSolid',
        },
        style: 'esriSFSSolid',
      },
    },
  ],
  field: 'P_PTSDF_D2',
  legendOptions: {},
  minValue: 0,
});

export const Default = () => (
  <div className="flex w-6 flex-col space-y-2">
    <Legend
      featureLayer={{
        renderer: brownFields,
        geometryType: 'point',
        opacity: 1,
      }}
    />
    <Legend
      featureLayer={{
        renderer: groundwater,
        geometryType: 'polygon',
        opacity: 1,
      }}
    />
    <Legend
      featureLayer={{
        renderer: assessedLakes,
        geometryType: 'point',
        opacity: 1,
      }}
    />
    <Legend
      featureLayer={{
        renderer: huc,
        geometryType: 'polygon',
        opacity: 0.65,
      }}
    />
    <Legend
      featureLayer={{
        renderer: classBreaks,
        geometryType: 'polygon',
        opacity: 0.65,
      }}
    />
  </div>
);
