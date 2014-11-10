define([
    'app/config',

    'dojo/topic',
    'dojo/_base/lang',
    'dojo/_base/declare',
    'dojo/_base/Color',

    'dijit/Destroyable',

    'esri/layers/FeatureLayer',
    'esri/SpatialReference',
    'esri/tasks/FeatureSet',
    'esri/tasks/query',
    'esri/layers/LabelClass'

], function(
    config,

    topic,
    lang,
    declare,
    Color,

    Destroyable,

    FeatureLayer,
    SpatialReference,
    FeatureSet,
    Query,
    LabelClass
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
        },{
            name: fn.ENVIROAPPLABEL,
            type: 'esriFieldTypeString',
            alias: fn.ENVIROAPPLABEL,
            length: 50,
            domain: null
        },{
            name: fn.ENVIROAPPSYMBOL,
            type: 'esriFieldTypeString',
            alias: fn.ENVIROAPPSYMBOL,
            length: 50,
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

        // layerIndex: String
        //      layer index
        layerIndex: null,

        constructor: function (color, featureSet, geometryType, layerIndex) {
            // summary:
            //      description
            // color: Number[]
            //      color of the map symbol
            // featureSet: Object[]
            //      The features found for this layer
            // geometryType: String
            //      point or polygon
            // layerIndex: String
            //      The index number for this query layer
            console.log('app/search/ResultLayer:constructor', arguments);

            var ql = config.getQueryLayerByIndex(layerIndex);

            // sort features for drawing order if needed
            // tried sorting the features in the database but the search
            // api didn't seem to honor that sorting
            if (ql.sortField !== 'n/a') {
                var fld = ql.sortField.split('|')[0];
                var direction = ql.sortField.split('|')[1];
                var sortFunc = function (a, b) {
                    var aValue = a.attributes[fld];
                    var bValue = b.attributes[fld];
                    if (direction === 'DESC') {
                        return aValue < bValue;
                    } else {
                        return bValue > aValue;
                    }
                };
                featureSet.sort(sortFunc);
            }

            var featureCollectionObject = {
                layerDefinition: new DefaultLayerDefinition(color, geometryType),
                featureSet: new FeatureSet({
                    features: featureSet,
                    geometryType: (geometryType === 'point') ? 'esriGeometryPoint' : 'esriGeometryPolygon'
                })
            };

            if (ql.ENVIROAPPSYMBOL !== 'n/a') {
                featureCollectionObject.layerDefinition.drawingInfo.renderer = ql.renderer;
            }

            this.fLayer = new FeatureLayer(featureCollectionObject, {
                showLabels: true,
                outFields: ['*'],
                id: ql.namea
            });
            this.fLayer.setOpacity(config.symbols.resultSymbolOpacity);
            this.fLayer.setLabelingInfo([
                new LabelClass({
                    labelExpression: '[' + config.fieldNames.queryLayers.ENVIROAPPLABEL + ']',
                    labelPlacement: 'above-right',
                    minScale: config.labelsMinScale
                })
            ]);

            this.fLayer.setSelectionSymbol((geometryType === 'point') ?
                config.symbols.selection.point :
                config.symbols.selection.polygon
            );
            this.layerIndex = layerIndex;

            topic.publish(config.topics.appResultLayer.addLayer, this.fLayer, geometryType);
            this.fLayer.show();

            this.own(
                topic.subscribe(config.topics.appSearch.searchStarted, lang.hitch(this, 'destroy')),
                topic.subscribe(config.topics.appSearch.clear, lang.hitch(this, 'destroy')),
                topic.subscribe(config.topics.appResultLayer.highlightFeature, lang.hitch(this, 'onHighlight')),
                topic.subscribe(config.topics.appResultLayer.clearSelection, lang.hitch(this.fLayer, 'clearSelection'))
            );

            this.fLayer.on('click', lang.hitch(this, 'onClick'));
        },
        destroy: function () {
            // summary:
            //      destroys the object and removes the layer from the map
            console.log('app/search/ResultLayer:destroy', arguments);

            topic.publish(config.topics.appResultLayer.removeLayer, this.fLayer);

            this.inherited(arguments);
        },
        onHighlight: function (oid, layerIndex) {
            // summary:
            //      clears selection and selects if appropriate
            // oid: Number
            // layerIndex: String
            // console.log('app/search/ResultLayer:onHighlight', arguments);

            this.fLayer.clearSelection();

            if (layerIndex === this.layerIndex) {
                var query = new Query();
                query.objectIds = [oid];
                this.fLayer.selectFeatures(query);
            }
        },
        onClick: function (evt) {
            // summary:
            //      user clicks on a feature
            //      fires topic to initiate an identify on that feature
            // evt: Object graphic click
            console.log('app/search/ResultLayer:onClick', arguments);

            var g = evt.graphic;
            g.attributes.parent = this.layerIndex;
            g.attributes.geometry = g.geometry;

            topic.publish(config.topics.appSearch.identify, g.attributes);
            topic.publish(config.topics.appResultLayer.highlightFeature, g.attributes.OBJECTID, this.layerIndex);
            topic.publish(config.topics.app.showGrid);
        }
    });
});