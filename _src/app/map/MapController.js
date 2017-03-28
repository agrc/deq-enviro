define([
    'app/config',

    'dojo/Deferred',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/lang',

    'esri/geometry/Extent',
    'esri/graphic',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/FeatureLayer',
    'esri/layers/GraphicsLayer'
], function (
    config,

    Deferred,
    topic,
    array,
    lang,

    Extent,
    Graphic,
    ArcGISDynamicMapServiceLayer,
    ArcGISTiledMapServiceLayer,
    FeatureLayer,
    GraphicsLayer
) {
    return {
        // description:
        //      Handles interaction between app widgets and the map. Mostly through pub/sub

        // handles: Object[]
        //      container to track handles for this object
        handles: null,

        // extentChangePromise: Number
        //      keep track of zoom and pan promises for mapIsZoomingOrPanning
        extentChangePromise: null,

        // searchGraphics: GraphicsLayer
        //      the layer that shows the search graphics
        searchGraphics: null,

        // highlightLayer: GraphicsLayer
        //      the layer that shows the highlighted feature
        highlightLayer: null,

        // selectedGraphic: Graphic
        //      the currently selected feature on the map
        selectedGraphic: null,


        // Properties to be sent into constructor
        // map: agrc/widgets/map/BaseMap
        map: null,

        init: function (params) {
            // summary:
            //      description
            console.log('app/MapController::constructor', arguments);

            this.handles = [];

            lang.mixin(this, params);

            // clear selected features if the user clicks on the map but
            // not on any feature
            var that = this;
            this.map.on('click', function (evt) {
                if (that.highlightLayer && !evt.graphic) {
                    that.highlightLayer.clear();
                    that.selectedGraphic = null;
                }
            });

            this.setUpSubscribes();
            this.setUpPublishes();
        },
        setUpSubscribes: function () {
            // summary:
            //      subscribes to topics
            console.log('app/map/MapController:setUpSubscribes', arguments);

            var t = config.topics;
            var that = this;
            this.handles.push(
                topic.subscribe(t.appMapReferenceLayerToggle.addLayer,
                    lang.hitch(this, 'addReferenceLayer')),
                topic.subscribe(t.appMapReferenceLayerToggle.toggleLayer,
                    lang.hitch(this, 'toggleReferenceLayer')),
                topic.subscribe(t.appMapMapController.zoomToSearchGraphic,
                    lang.hitch(this, 'zoomToSearchGraphic')),
                topic.subscribe(t.appMapMapController.graphic,
                    lang.partial(lang.hitch(this, 'graphic'),
                                 'searchGraphics',
                                 config.symbols.zoom)),
                topic.subscribe(t.appSearch.searchStarted, function () {
                    that.showLoader();
                    if (that.highlightLayer) {
                        that.highlightLayer.clear();
                    }
                }),
                topic.subscribe(t.appSearch.featuresFound,
                    lang.hitch(this, 'hideLoader')),
                topic.subscribe(t.appSearch.searchError,
                    lang.hitch(this, 'hideLoader')),
                topic.subscribe(t.appMapMapController.clearGraphics,
                    lang.hitch(this, 'clearGraphics')),
                topic.subscribe(t.appResultLayer.addLayer,
                    lang.hitch(this, 'addQueryLayer')),
                topic.subscribe(t.appResultLayer.removeLayer,
                    lang.hitch(this, 'removeQueryLayer')),
                topic.subscribe(t.appMapMapController.zoom,
                    lang.hitch(this, 'zoom')),
                topic.subscribe(t.appMapMapController.showHighlightedFeature,
                    lang.partial(lang.hitch(this, 'graphic'),
                                 'highlightLayer',
                                 config.symbols.selection)),
                topic.subscribe(t.appSearch.featuresFound,
                    lang.hitch(this, 'zoomToFeaturesFound'))
            );
        },
        mapIsZoomingOrPanning: function () {
            // summary:
            //      description
            // Deferred
            console.log('app/MapController:mapIsZoomingOrPanning', arguments);

            console.log('this.extentChangePromise', this.extentChangePromise);

            return this.extentChangePromise || new Deferred().resolve();
        },
        setUpPublishes: function () {
            // summary:
            //      sets up publishes
            console.log('app/map/MapController:setUpPublishes', arguments);

            var that = this;
            this.handles.push(
                this.map.on('zoom-end', function () {
                    topic.publish(config.topics.appMapMapController.mapZoom, that.map.getZoom());
                })
            );
        },
        addReferenceLayer: function (url, LayerClass, layerIndex, layerProps) {
            // summary:
            //      description
            // layer: esri/layer
            // layerIndex: Number
            console.log('app/map/MapController:addReferenceLayer', arguments);

            var config = lang.mixin({
                visible: false,
                id: url + '_' + layerIndex
            }, layerProps);

            if (LayerClass === FeatureLayer) {
                url = `${url}/${layerIndex}`;
            }

            var lyr = new LayerClass(url, config);

            this.map.addLayer(lyr);
            this.map.addLoaderToLayer(lyr);

            if (layerIndex !== null && LayerClass !== FeatureLayer) {
                lyr.setVisibleLayers([-1]);
            }
        },
        toggleReferenceLayer: function (url, layerIndex, on) {
            // summary:
            //      toggles a reference layer on the map

            console.log('app/map/MapController:toggleReferenceLayer', arguments);

            var lyr = this.map.getLayer(url + '_' + layerIndex);

            if (layerIndex !== null && !(lyr instanceof FeatureLayer)) {
                var visLyrs = lyr.visibleLayers;
                if (on) {
                    visLyrs.push(layerIndex);
                } else {
                    visLyrs.splice(array.indexOf(visLyrs, layerIndex), 1);
                }
                if (visLyrs.length === 1) {
                    lyr.hide();
                } else if (!lyr.visible) {
                    lyr.show();
                }
                lyr.setVisibleLayers(visLyrs);
            } else {
                var f = (on) ? lyr.show : lyr.hide;
                f.apply(lyr);
            }
        },
        addQueryLayer: function (layer, geometryType) {
            // summary:
            //      adds the query layer Feature Layer to the map
            // layer: esri/layers/FeatureLayer
            // geometryType: String (point || polygon)
            //      Used to determine layer order (polygons go on the bottom)
            console.log('app/map/MapController:addQueryLayer', arguments);

            var index = (geometryType === 'polygon') ? 2 : undefined;
            this.map.addLayer(layer, index);
            this.map.addLoaderToLayer(layer);
        },
        removeQueryLayer: function (layer) {
            // summary:
            //      removes the layer from the map
            // layer: esri/layers/FeatureLayer
            console.log('app/map/MapController:removeQueryLayer', arguments);

            this.map.removeLayer(layer);
        },
        zoomToSearchGraphic: function (geometry) {
            // summary:
            //      zooms to the geometry and then creates a new graphic
            // geometry: esri/geometry/polygon
            console.log('app/map/MapController:zoomToSearchGraphic', arguments);

            this.zoom(geometry);
            this.graphic('searchGraphics', config.symbols.zoom, geometry);
        },
        zoom: function (geometry) {
            // summary:
            //      zooms the map to the passed in geometry
            // geometry: esri/geometry
            console.log('app/map/MapController::zoom', arguments);

            var that = this;
            var removePromise = function () {
                that.extentChangePromise = null;
            };
            geometry.spatialReference = this.map.spatialReference;

            if (geometry.type === 'point') {
                this.extentChangePromise = this.map.centerAndZoom(geometry, 13)
                    .then(removePromise);
            } else if (geometry.type === 'extent') {
                this.extentChangePromise = this.map.setExtent(geometry, true);
            } else {
                this.extentChangePromise = this.map.setExtent(geometry.getExtent(), true)
                    .then(removePromise);
            }
        },
        graphic: function (layerPropName, symbolSet, geometry) {
            // summary:
            //      creates a graphic and adds it to the map
            // layerPropName: String
            // symbolSet: Object with symbols for each geometry type
            // geometry: esri/geometry
            console.log('app/map/MapController::graphic', arguments);

            if (!this[layerPropName]) {
                this[layerPropName] = new GraphicsLayer();
                this.map.addLayer(this[layerPropName]);
            }

            this[layerPropName].clear();
            var graphic = new Graphic(geometry, symbolSet[geometry.type]);
            this[layerPropName].add(graphic);
            this.selectedGraphic = graphic;
        },
        destroy: function () {
            // summary:
            //      destroys all handles
            console.log('app/map/MapController:destroy', arguments);

            array.forEach(this.handles, function (hand) {
                hand.remove();
            });
        },
        showLoader: function () {
            // summary:
            //      description
            console.log('app/map/MapController:showLoader', arguments);

            this.map.showLoader();
        },
        hideLoader: function () {
            // summary:
            //      description
            console.log('app/map/MapController:hideLoader', arguments);

            this.map.hideLoader();
        },
        clearGraphics: function () {
            // summary:
            //      clears any graphics on the map
            console.log('app/map/MapController:clearGraphics', arguments);

            if (this.searchGraphics) {
                this.searchGraphics.clear();
            }
            if (this.highlightLayer) {
                this.highlightLayer.clear();
                this.selectedGraphic = null;
            }
        },
        zoomToFeaturesFound: function (results) {
            // summary:
            //      zooms the map to the sum extent of all of the features found
            // results: Object
            console.log('app/map/MapController:zoomToFeaturesFound', arguments);

            var sumExtent;
            for (var lyr in results) {
                if (results.hasOwnProperty(lyr) && results[lyr].features.length) {
                    var ext = new Extent(results[lyr].extent);
                    ext.setSpatialReference(config.spatialReference);

                    if (!sumExtent) {
                        sumExtent = ext;
                    } else {
                        sumExtent = sumExtent.union(ext);
                    }
                }
            }

            if (sumExtent) {
                this.zoom(sumExtent);
            }
        },
        getSelectedFeature: function () {
            // summary:
            //      returns the currently selected feature or null if there is no selection
            console.log('app/map/MapController:getSelectedFeature', arguments);

            return this.selectedGraphic;
        }
    };
});
