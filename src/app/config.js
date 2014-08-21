/* jshint maxlen:false */
define([
    'dojo/_base/Color',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/request',
    'dojo/Deferred',
    'dojo/has',

    'esri/SpatialReference',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/symbols/CartographicLineSymbol'
], function (
    Color,
    array,
    lang,
    request,
    Deferred,
    has,

    SpatialReference,
    SimpleFillSymbol,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    CartographicLineSymbol
    ) {

    var zoomColor = new Color([255, 255, 0]);
    var zoomFillColor = new Color(zoomColor.toRgb().concat([0.15]));
    var selectionColor = new Color([240, 18, 190]);
    var selectionFillColor = new Color(selectionColor.toRgb().concat([0.35]));
    window.AGRC = {
        // app: app.App
        //      global reference to App
        app: null,

        // appName: String
        //      name of the app used in permissionsproxy
        appName: 'deq',

        // version: String
        //      The version number.
        version: '0.9.0',

        // popupDelay: Number
        //      The delay (in milliseconds) before a popup is shown on hover.
        popupDelay: 250,

        gridIdentifyHeight: 237,

        // topics: Object
        //      The topic strings used in this app
        topics: {
            appMapReferenceLayerToggle: {
                addLayer: 'app/map/ReferenceLayerToggle.addLayer',
                toggleLayer: 'app/map/ReferenceLayerToggle.toggleLayer'
            },
            appQueryLayer: {
                addLayer: 'app/QueryLayer.addLayer',
                removeLayer: 'app/QueryLayer.removeLayer'
            },
            appMapMapController: {
                mapZoom: 'app/map/MapController.mapZoom',
                zoomToSearchGraphic: 'app/map/MapController.zoomToSearchGraphic',
                graphic: 'app/map/MapController.graphic',
                clearGraphics: 'app/map/MapController.clearGraphics',
                zoom: 'app/map/MapController.zoom'
            },
            appWizard: {
                requestAccess: 'app/Wizard.requestAccess',
                showSearch: 'app/Wizard.showSearch',
                showQueryLayers: 'app/Wizard.showQueryLayers',
                showResults: 'app/Wizard.showResults'
            },
            appSearch: {
                featuresFound: 'app/search/Search.featuresFound',
                searchStarted: 'app/search/Search.searchStarted',
                searchError: 'app/search/Search.searchError',
                clear: 'app/search/Search.clear',
                identify: 'app/search/identify'
            },
            appResultLayer: {
                addLayer: 'app/search/ResultLayer.addLayer',
                removeLayer: 'app/search/ResultLayer.removeLayer',
                highlightFeature: 'app/search/ResultLayer.highlightFeature',
                clearSelection: 'app/search/ResultLayer.clearSelection'
            },
            appSearchIdentifyPane: {
                backToResults: 'app/search/IdentifyPane.backToResults'
            },
            app: {
                hideGrid: 'app/App.hideGrid',
                showGrid: 'app/App.showGrid'
            }
        },

        // urls: Object
        //      Urls for the project
        urls: {
            UtahPLSS: 'http://mapserv.utah.gov/arcgis/rest/services/UtahPLSS/MapServer',
            DEQEnviro: '/arcgis/rest/services/DEQEnviro/MapServer',
            json: '/webdata/DEQEnviro.json',
            geometryService: '/arcgis/rest/services/Geometry/GeometryServer',
            terrain: 'http://mapserv.utah.gov/arcgis/rest/services/BaseMaps/Terrain/MapServer',
            securedServicesBaseUrl: '/none',
            api: {
                search: location.pathname.replace(/\/(src|dist)\/[^/]*$/, '') + '/api/search'
            }
        },

        // layerIndices: Object
        //      Indices of layers within map services.
        layerIndices: {
            landOwnership: 0,
            environmentalCovenants: 1,
            huc: 2,
            indianTribal: 3,
            city: 1 // Terrain service
        },

        // fieldNames: {}
        fieldNames: {
            cities: {
                NAME: 'NAME'
            },
            counties: {
                NAME: 'NAME'
            },
            utah: {
                STATE: 'STATE'
            },
            queryLayers: {
                ADDRESS: 'ADDRESS',
                CITY: 'CITY',
                ID: 'ID',
                NAME: 'NAME',
                TYPE: 'TYPE',
                UNIQUE_ID: 'UNIQUE_ID'
            }
        },

        // featureClassNames: {}
        featureClassNames: {
            counties: 'SGID10.BOUNDARIES.Counties',
            utah: 'SGID10.BOUNDARIES.Utah'
        },

        // TRSMinScaleLevel: Number
        //      The minimum scale level that the TRS Layer widget will appear disabled.
        TRSMinScaleLevel: 5,

        // appJson: Object
        //      Cache for data returned by getAppJson
        appJson: null,

        // queryLayerNames: Object
        //      Lookup for query layer name by layer index
        //      Populated in getAppJson below
        queryLayerNames: null,

        // spatialReference SpatialReference
        //      The spatial reference of the map
        spatialReference: new SpatialReference(26912),

        // symbols: Object
        //      Graphic symbols used in this app
        symbols: {
            zoom: {
                polygon: new SimpleFillSymbol(
                    SimpleFillSymbol.STYLE_SOLID,
                    new SimpleLineSymbol(
                        SimpleLineSymbol.STYLE_SOLID,
                        zoomColor,
                        2
                    ),
                    zoomFillColor),
                point: new SimpleMarkerSymbol(
                    SimpleMarkerSymbol.STYLE_CIRCLE,
                    13,
                    new SimpleLineSymbol(
                        SimpleLineSymbol.STYLE_SOLID,
                        zoomColor,
                        2),
                    zoomFillColor),
                polyline: new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    zoomColor,
                    4
                )
            },
            resultSymbolOpacity: 190,
            colors: [
                [31, 120, 180],
                [51, 160, 44],
                [227, 26, 28],
                [255, 127, 0],
                [106, 61, 154],
                [253, 191, 111],
                [251, 154, 153],
                [178, 223, 138],
                [166, 206, 227],
                [202, 178, 214],
                [255, 255, 153],
                [177, 89, 40]
            ],
            selection: {
                polygon: new SimpleFillSymbol(
                    SimpleFillSymbol.STYLE_SOLID,
                    new CartographicLineSymbol(
                        CartographicLineSymbol.STYLE_SOLID,
                        selectionColor,
                        3,
                        CartographicLineSymbol.CAP_ROUND,
                        CartographicLineSymbol.JOIN_ROUND),
                    selectionFillColor
                ),
                point: new SimpleMarkerSymbol(
                    SimpleMarkerSymbol.STYLE_CIRCLE,
                    15,
                    new SimpleLineSymbol(
                        SimpleLineSymbol.STYLE_SOLID,
                        selectionColor,
                        2),
                    selectionFillColor
                )
            }
        },

        // messages: Object
        //      Messages and text used throughout the app
        messages: {
            noFeaturesFound: 'No results'
        },

        getAppJson: function () {
            // summary:
            //      requests the DEQEnviro.json data and returns it, caches the results for future requests
            console.log('app.config::getAppJson', arguments);

            var def = new Deferred();
            var that = this;

            if (!this.appJson) {
                request(this.urls.json, {
                    handleAs: 'json'
                }).then(function (json) {
                    that.queryLayerNames = {};
                    array.forEach(json.queryLayers, function (ql) {
                        that.queryLayerNames[ql.index] = ql.name;
                    });
                    def.resolve(that.appJson = json);
                });
            } else {
                def.resolve(this.appJson);
            }

            return def.promise;
        },
        getQueryLayerByIndex: function (index) {
            // summary:
            //      description
            // index: String
            console.log('app/config:getQueryLayerByIndex', arguments);

            return this.getDatasetByIndex(this.appJson.queryLayers, index);
        },
        getRelatedTableByIndex: function (index) {
            // summary:
            //      description
            // index: String
            console.log('app/config:getRelatedTableByIndex', arguments);
        
            return this.getDatasetByIndex(this.appJson.relatedTables, index);
        },
        getDatasetByIndex: function (datasets, index) {
            // this could easily be done with one loop but I wanted to try
            // out memoization :)
            this._cached = this._cached || {};

            if (this._cached[index]) {
                return this._cached[index];
            }
        
            var returnLayer;
            array.some(datasets, function (ql) {
                if (ql.index + '' === index) {
                    returnLayer = ql;
                    return true;
                } else {
                    return false;
                }
            });

            this._cached[index] = returnLayer;

            return returnLayer;
        }
    };

    if (has('agrc-api-key') === 'prod') {
        // mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-A94B063C533889';
    } else if (has('agrc-api-key') === 'stage') {
        // test.mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-AC122FA9671436';
    } else {
        // localhost
        window.AGRC.apiKey = 'AGRC-E5B94F99865799';
    }

    return window.AGRC;
});