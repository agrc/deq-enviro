define([
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/topic',

    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/graphic',

    '../config'

], function(
    lang,
    array,
    topic,

    ArcGISDynamicMapServiceLayer,
    ArcGISTiledMapServiceLayer,
    Graphic,

    config
) {
    return {
        // description:
        //      Handles interaction between app widgets and the map. Mostly through pub/sub

        // handles: Object[]
        //      container to track handles for this object
        handles: [],


        // Properties to be sent into constructor
        // map: agrc/widgets/map/BaseMap
        map: null,

        init: function (params) {
            // summary:
            //      description
            console.log('app/MapController::constructor', arguments);

            lang.mixin(this, params);

            this.setUpSubscribes();
            this.setUpPublishes();
        },
        setUpSubscribes: function () {
            // summary:
            //      subscribes to topics
            console.log('app/map/MapController:setUpSubscribes', arguments);
        
            var t = config.topics;
            this.handles.push(
                topic.subscribe(t.appMapReferenceLayerToggle.addLayer,
                    lang.hitch(this, 'addReferenceLayer')),
                topic.subscribe(t.appMapReferenceLayerToggle.toggleLayer,
                    lang.hitch(this, 'toggleReferenceLayer')),
                topic.subscribe(t.appQueryLayer.addLayer,
                    lang.hitch(this, 'addQueryLayer')),
                topic.subscribe(t.mapController.zoomTo,
                    lang.hitch(this, 'zoom')),
                topic.subscribe(t.mapController.graphic,
                    lang.hitch(this, 'graphic')),
                topic.subscribe(t.appSearch.searchStarted,
                    lang.hitch(this, 'showLoader')),
                topic.subscribe(t.appSearch.featuresFound,
                    lang.hitch(this, 'hideLoader')),
                topic.subscribe(t.appSearch.searchError,
                    lang.hitch(this, 'hideLoader'))
            );
        },
        setUpPublishes: function () {
            // summary:
            //      sets up publishes
            console.log('app/map/MapController:setUpPublishes', arguments);
        
            var that = this;
            this.handles.push(
                this.map.on('zoom-end', function () {
                    topic.publish(config.topics.appMapController.mapZoom, that.map.getZoom());
                })
            );
        },
        addReferenceLayer: function (url, tiledService, layerIndex, layerProps) {
            // summary:
            //      description
            // layer: esri/layer
            // layerIndex: Number
            console.log('app/map/MapController:addReferenceLayer', arguments);
        
            // check to see if layer has already been added to the map
            var that = this;
            var lyr;
            var alreadyAdded = array.some(this.map.layerIds, function (id) {
                return that.map.getLayer(id).url === url;
            });

            if (!alreadyAdded) {
                var LayerClass = (tiledService) ? ArcGISTiledMapServiceLayer : ArcGISDynamicMapServiceLayer;
                var config = lang.mixin({visible: false}, layerProps);

                lyr = new LayerClass(url, config);

                this.map.addLayer(lyr);
                this.map.addLoaderToLayer(lyr);

                if (layerIndex !== null) {
                    lyr.setVisibleLayers([-1]);
                }
            }
        },
        toggleReferenceLayer: function (url, layerIndex, on) {
            // summary:
            //      toggles a reference layer on the map

            console.log('app/map/MapController:toggleReferenceLayer', arguments);

            var lyr;
            var that = this;
            array.some(this.map.layerIds, function (id) {
                var l = that.map.getLayer(id);
                if (l.url === url) {
                    lyr = l;
                    return true;
                }
            });
        
            if (layerIndex !== null) {
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
        addQueryLayer: function (layer) {
            // summary:
            //      adds the query layer Feature Layer to the map
            // layer: esri/layers/FeatureLayer
            console.log('app/map/MapController:addQueryLayer', arguments);
        
            this.map.addLayer(layer);
            this.map.addLoaderToLayer(layer);
        },
        zoom: function (geometry) {
            // summary:
            //      zooms the map to the passed in geometry
            // geometry: esri/geometry/polygon
            console.log('app/map/MapController::zoom', arguments);

            this.map.setExtent(geometry.getExtent(), true);
            this.graphic(geometry);
        },
        graphic: function (geometry) {
            // summary:
            //      creates a graphic and adds it to the map
            // geometry: esri/geometry
            console.log('app/map/MapController::graphic', arguments);
        
            this.map.graphics.clear();
            this.map.graphics.add(new Graphic(geometry, config.symbols.zoom[geometry.type]));
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
        }
    };
});