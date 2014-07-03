define([
    'app/config',

    'dojo/topic',
    'dojo/_base/lang',
    'dojo/_base/declare',

    'dijit/Destroyable',

    'esri/layers/FeatureLayer',
    'esri/SpatialReference',
    'esri/tasks/FeatureSet'

], function(
    config,

    topic,
    lang,
    declare,

    Destroyable,

    FeatureLayer,
    SpatialReference,
    FeatureSet
) {
    var fn = config.fieldNames.queryLayers;
    var DefaultLayerDefinition = declare(null, {
        drawingInfo: {
            renderer: null,
            transparency: 0,
            labelingInfo: null
        },
        displayField: 'NAME',
        fields: [{
            name: 'OBJECTID',
            type: 'esriFieldTypeOID',
            alias: 'OBJECTID',
            domain: null
        }, {
            name: fn.ID,
            type: 'esriFieldTypeString',
            alias: fn.ID,
            length: 150,
            domain: null
        }, {
            name: fn.NAME,
            type: 'esriFieldTypeString',
            alias: fn.NAME,
            length: 150,
            domain: null
        }, {
            name: fn.ADDRESS,
            type: 'esriFieldTypeString',
            alias: fn.ADDRESS,
            length: 150,
            domain: null
        }, {
            name: fn.CITY,
            type: 'esriFieldTypeString',
            alias: fn.CITY,
            length: 150,
            domain: null
        }, {
            name: fn.TYPE,
            type: 'esriFieldTypeString',
            alias: fn.TYPE,
            length: 150,
            domain: null
        }],

        // pointRenderer: Object
        //      As returned from a feature service
        pointRenderer: {
            type: 'simple',
            symbol: {
                type: 'esriSMS',
                style: 'esriSMSCircle',
                color: null, // to be filled in by the constructor
                size: 8,
                angle: 0,
                xoffset: 0,
                yoffset: 0,
                outline: {
                    color: [
                        0,
                        0,
                        0,
                        255
                    ],
                    width: 1
                }
            },
            label: '',
            description: ''
        },

        // polygonRenderer: Object
        //      As returned from a feature service
        polygonRenderer: {
            type: 'simple',
            symbol: {
                type: 'esriSFS',
                style: 'esriSFSSolid',
                color: null, // to be filled in by the constructor
                outline: {
                    type: 'esriSLS',
                    style: 'esriSLSSolid',
                    color: [
                        0,
                        0,
                        0,
                        255
                    ],
                    width: 0.4
                }
            },
            label: '',
            description: ''
        },
        constructor: function (color, geometryType) {
            // summary:
            //      mix in the color
            // color: Number[]
            // geometryType: String
            //      point or polygon
            console.log('DefaultLayerDefinition:constructor', arguments);
        
            this.drawingInfo.renderer = this[geometryType + 'Renderer'];
            this.drawingInfo.renderer.symbol.color = color.concat([config.symbols.resultSymbolOpacity]);
        }
    });

    return declare([Destroyable], {
        // description:
        //      Feature layer associated with the results for a query layer search.


        // fLayer: FeatureLayer
        //      The feature layer that contains the features for this object
        fLayer: null,

        constructor: function (color, featureSet, geometryType) {
            // summary:
            //      description
            // color: Number[]
            //      color of the map symbol
            // featureSet: Object[]
            //      The features found for this layer
            // geometryType: String
            //      point or polygon
            console.log('app/search/ResultLayer:constructor', arguments);

            var featureCollectionObject = {
                layerDefinition: new DefaultLayerDefinition(color, geometryType),
                featureSet: new FeatureSet({
                    features: featureSet,
                    geometryType: (geometryType === 'point') ? 'esriGeometryPoint' : 'esriGeometryPolygon'
                })
            };

            this.fLayer = new FeatureLayer(featureCollectionObject);

            topic.publish(config.topics.appResultLayer.addLayer, this.fLayer);
            this.fLayer.show();

            this.own(topic.subscribe(config.topics.appSearch.searchStarted, lang.hitch(this, 'destroy')));
        },
        destroy: function () {
            // summary:
            //      destroys the object and removes the layer from the map
            console.log('app/search/ResultLayer:destroy', arguments);
        
            topic.publish(config.topics.appResultLayer.removeLayer, this.fLayer);

            this.inherited(arguments);
        }
    });
});