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
    var DefaultLayerDefinition = declare(null, {
        geometryType: 'esriGeometryPoint',
        drawingInfo: {
            renderer: {
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
            name: 'ID',
            type: 'esriFieldTypeString',
            alias: 'ID',
            length: 150,
            domain: null
        }, {
            name: 'NAME',
            type: 'esriFieldTypeString',
            alias: 'NAME',
            length: 150,
            domain: null
        }, {
            name: 'ADDRESS',
            type: 'esriFieldTypeString',
            alias: 'ADDRESS',
            length: 150,
            domain: null
        }, {
            name: 'CITY',
            type: 'esriFieldTypeString',
            alias: 'CITY',
            length: 150,
            domain: null
        }, {
            name: 'TYPE',
            type: 'esriFieldTypeString',
            alias: 'TYPE',
            length: 150,
            domain: null
        }],
        constructor: function (color) {
            // summary:
            //      mix in the color
            // color: Number[]
            console.log('DefaultLayerDefinition:constructor', arguments);
        
            this.drawingInfo.renderer.symbol.color = color.concat([config.symbols.resultSymbolOpacity]);
        }
    });

    return declare([Destroyable], {
        // description:
        //      Feature layer associated with the results for a query layer search.


        // fLayer: FeatureLayer
        //      The feature layer that contains the features for this object
        fLayer: null,

        constructor: function (color, featureSet) {
            // summary:
            //      description
            // color: Number[]
            //      color of the map symbol
            // featureSet: Object[]
            //      The features found for this layer
            console.log('app/search/ResultLayer:constructor', arguments);

            var featureCollectionObject = {
                layerDefinition: new DefaultLayerDefinition(color),
                featureSet: new FeatureSet({
                    features: featureSet,
                    geometryType: 'esriGeometryPoint'
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