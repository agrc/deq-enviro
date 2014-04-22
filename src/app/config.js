define([
    'dojo/_base/Color',
    'dojo/request',
    'dojo/Deferred',
    'dojo/has',

    'esri/SpatialReference',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol'
], function (
    Color,
    request,
    Deferred,
    has,

    SpatialReference,
    SimpleFillSymbol,
    SimpleLineSymbol
    ) {
    window.AGRC = {
        // app: app.App
        //      global reference to App
        app: null,

        // appName: String
        //      name of the app used in permissionsproxy
        appName: 'deq',

        // version: String
        //      The version number.
        version: '0.2.0',

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
                zoomTo: 'app/MapController.zoomTo'
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
            securedServicesBaseUrl: '/none'
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

        // spatialReference SpatialReference
        //      The spatial reference of the map
        spatialReference: new SpatialReference(26912),

        // symbols: Object
        //      Graphic symbols used in this app
        symbols: {
            zoom: new SimpleFillSymbol(
                SimpleFillSymbol.STYLE_NULL,
                new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_DASHDOT,
                    new Color([255, 255, 0]),
                    4),
                null)
        },

        getAppJson: function () {
            // summary:
            //      requests the DEQEnviro.json data and returns it, caches the results for future requests
            console.log('app.config::getAppJson', arguments);

            var def = new Deferred();
        
            if (!this.appJson) {
                request(this.urls.json, {
                    handleAs: 'json'
                }).then(function (json) {
                    def.resolve(this.appJson = json);
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