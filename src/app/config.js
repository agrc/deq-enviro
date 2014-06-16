define([
    'dojo/_base/Color',
    'dojo/_base/array',
    'dojo/request',
    'dojo/Deferred',
    'dojo/has',

    'esri/SpatialReference',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleMarkerSymbol'
], function (
    Color,
    array,
    request,
    Deferred,
    has,

    SpatialReference,
    SimpleFillSymbol,
    SimpleLineSymbol,
    SimpleMarkerSymbol
    ) {

    var zoomColor = new Color([255, 255, 0]);
    var zoomFillColor = new Color(zoomColor.toRgb().concat([0.25]));
    window.AGRC = {
        // app: app.App
        //      global reference to App
        app: null,

        // appName: String
        //      name of the app used in permissionsproxy
        appName: 'deq',

        // version: String
        //      The version number.
        version: '0.4.0',

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
            appMapController: {
                mapZoom: 'app/MapController.mapZoom'
            },
            appWizard: {
                requestAccess: 'app/Wizard.requestAccess',
                showSearch: 'app/Wizard.showSearch',
                showQueryLayers: 'app/Wizard.showQueryLayers',
                showResults: 'app/Wizard.showResults'
            },
            mapController: {
                zoomTo: 'app/MapController.zoomTo',
                graphic: 'app/MapController.graphic'
            },
            appSearch: {
                featuresFound: 'app/search/Search.featuresFound',
                searchStarted: 'app/search/Search.searchStarted',
                searchError: 'app/search/Search.searchError'
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
            }
        },

        // messages: Object
        //      Messages and text used throughout the app
        messages: {
            noFeaturesFound: 'No results found for this layer'
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
        window.AGRC.apiKey = 'AGRC-63E1FF17767822';
    }

    return window.AGRC;
});