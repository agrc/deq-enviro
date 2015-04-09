define([
    'app/config',

    'dijit/Destroyable',

    'dojo/_base/Color',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',

    'esri/layers/FeatureLayer',
    'esri/layers/LabelClass',
    'esri/renderers/SimpleRenderer',
    'esri/SpatialReference',
    'esri/tasks/FeatureSet',
    'esri/tasks/query'
], function(
    config,

    Destroyable,

    Color,
    declare,
    lang,
    topic,

    FeatureLayer,
    LabelClass,
    SimpleRenderer,
    SpatialReference,
    FeatureSet,
    Query
) {
    var getRenderer = function (geoType, color) {
        var renderers = {
            point: {
                type: 'simple',
                symbol: {
                    type: 'esriSMS',
                    style: 'esriSMSCircle',
                    color: null, // to be filled in later
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
            polygon: {
                type: 'simple',
                symbol: {
                    type: 'esriSFS',
                    style: 'esriSFSSolid',
                    color: null, // to be filled in later
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
            }
        };

        var ren = renderers[geoType];
        ren.symbol.color = color;
        return ren;
    };

    return declare([Destroyable], {
        // description:
        //      Feature layer associated with the results for a query layer search.


        // fLayer: FeatureLayer
        //      The feature layer that contains the features for this object
        fLayer: null,

        // layerIndex: String
        //      layer index
        layerIndex: null,

        constructor: function (color, oids, geometryType, layerIndex) {
            // summary:
            //      description
            // color: Number[]
            //      color of the map symbol
            // oids: Number[]
            //      The objectids of the features found for this layer
            // geometryType: String
            //      point or polygon
            // layerIndex: String
            //      The index number for this query layer
            console.log('app/search/ResultLayer:constructor', arguments);

            var ql = config.getQueryLayerByIndex(layerIndex);

            var layerConfig = {
                showLabels: true,
                outFields: [config.fieldNames.queryLayers.ENVIROAPPLABEL],
                id: ql.name,
                definitionExpression: 'OBJECTID IN(' + oids.join(', ') + ')',
                opacity: config.symbols.resultSymbolOpacity
            };
            if (ql.sortField !== 'n/a') {
                var fld = ql.sortField.split('|')[0];
                var direction = ql.sortField.split('|')[1];
                layerConfig.orderByFields = [fld + ' ' + direction];
            }
            var url = (ql.index[0] === 's') ? config.urls.secure : config.urls.DEQEnviro;

            this.fLayer = new FeatureLayer(url + '/' + parseInt(ql.index.replace('s', ''), 10), layerConfig);
            var that = this;
            this.fLayer.on('load', function () {
                that.fLayer.setLabelingInfo([
                    new LabelClass({
                        labelExpression: '[' + config.fieldNames.queryLayers.ENVIROAPPLABEL + ']',
                        labelPlacement: 'above-right',
                        minScale: config.labelsMinScale
                    })
                ]);
                if (ql.ENVIROAPPSYMBOL === 'n/a') {
                    that.fLayer.setRenderer(new SimpleRenderer(getRenderer(geometryType, color)));
                }
                that.fLayer.setSelectionSymbol((geometryType === 'point') ?
                    config.symbols.selection.point :
                    config.symbols.selection.polygon
                );
                that.fLayer.show();
            });

            this.layerIndex = layerIndex;

            topic.publish(config.topics.appResultLayer.addLayer, this.fLayer, geometryType);

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
            console.log('app/search/ResultLayer:onHighlight', arguments);

            if (layerIndex === this.layerIndex) {
                var query = new Query();
                query.objectIds = [oid];
                this.fLayer.queryFeatures(query).then(function (fSet) {
                    if (fSet.features.length > 0) {
                        topic.publish(config.topics.appMapMapController.showHighlightedFeature,
                            fSet.features[0].geometry);
                    }
                });
            }
        },
        onClick: function (evt) {
            // summary:
            //      user clicks on a feature
            //      fires topic to initiate an identify on that feature
            // evt: Object graphic click
            console.log('app/search/ResultLayer:onClick', arguments);

            evt.stopPropagation();

            var g = evt.graphic;
            g.attributes.parent = this.layerIndex;

            topic.publish(config.topics.appResultLayer.highlightFeature, g.attributes.OBJECTID, this.layerIndex);
            topic.publish(config.topics.appResultLayer.identifyFeature, g.attributes.OBJECTID, this.layerIndex);
            topic.publish(config.topics.app.showGrid);
        }
    });
});