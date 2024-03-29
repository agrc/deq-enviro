/* eslint-disable no-magic-numbers, max-len, camelcase */
define([
    'dojo/Deferred',
    'dojo/has',
    'dojo/request/xhr',
    'dojo/_base/array',
    'dojo/_base/Color',
    'dojo/_base/lang',

    'esri/config',
    'esri/SpatialReference',
    'esri/symbols/CartographicLineSymbol',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/tasks/GeometryService'
], function (
    Deferred,
    has,
    xhr,
    array,
    Color,
    lang,

    esriConfig,
    SpatialReference,
    CartographicLineSymbol,
    SimpleFillSymbol,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    GeometryService
) {
    var agsDomain;
    var AGRC = {};
    let mapDataLocation;
    if (has('agrc-build') === 'prod') {
        // *.utah.gov
        AGRC.apiKey = 'AGRC-D3CDE591211690';
        agsDomain = 'enviro.deq.utah.gov';
        // mapserv.utah.gov or enviro.deq.utah.gov
        AGRC.quadWord = 'result-table-secure-antenna';
        mapDataLocation = 'C:\\MapData';
    } else if (has('agrc-build') === 'stage') {
        // test.mapserv.utah.gov
        AGRC.apiKey = 'AGRC-AC122FA9671436';
        agsDomain = 'test.mapserv.utah.gov';
        esriConfig.defaults.io.corsEnabledServers.push(agsDomain);
        AGRC.quadWord = 'opera-event-little-pinball';
        mapDataLocation = 'C:\\forklift-stage\\data\\production';
    } else {
        // localhost
        xhr(require.baseUrl + 'secrets.json', {
            handleAs: 'json',
            sync: true
        }).then(function (secrets) {
            AGRC.quadWord = secrets.quadWord;
            AGRC.apiKey = secrets.apiKey;
        }, function () {
            throw 'Error getting secrets!';
        });
        agsDomain = 'localhost';
        mapDataLocation = 'C:\\forklift\\data\\production';
    }

    // force api to use CORS on mapserv thus removing the test request on app load
    // e.g. http://mapserv.utah.gov/ArcGIS/rest/info?f=json
    esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('api.mapserv.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('gis.trustlands.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('enviro.deq.utah.gov');

    var zoomColor = new Color([255, 255, 0]);
    var zoomFillColor = new Color(zoomColor.toRgb().concat([0.15]));
    var selectionColor = new Color([240, 18, 190]);
    var selectionFillColor = new Color(selectionColor.toRgb().concat([0.35]));

    var baseUrl = (agsDomain === '') ? '' : window.location.protocol + '//' + agsDomain;
    esriConfig.defaults.geometryService = new GeometryService(baseUrl + '/arcgis/rest/services/Geometry/GeometryServer');
    var deqServiceFolder = baseUrl + '/arcgis/rest/services/DEQEnviro';
    var secureUrl = deqServiceFolder + '/Secure/MapServer';
    window.AGRC = lang.mixin(AGRC, {
        // app: app.App
        //      global reference to App
        app: null,

        // appName: String
        //      name of the app used in permissionsproxy
        appName: 'deq',

        // user: Object
        //      set in App.js
        user: null,

        // version.: String
        //      The version number.
        version: '1.9.1',

        // popupDelay: Number
        //      The delay (in milliseconds) before a popup is shown on hover.
        popupDelay: 250,

        gridIdentifyHeight: 237,

        labelsMinScale: 250000,

        minBuffer: 0.1, // in miles

        defaultBaseMap: 'Lite',

        printMapTitle: 'Printed from the Utah DEQ Interactive Map',

        downloadDataPath: `${mapDataLocation}\\deqquerylayers.gdb`,

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
                zoom: 'app/map/MapController.zoom',
                showHighlightedFeature: 'app/map/MapController.showHighlightedFeature'
            },
            appSearch: {
                featuresFound: 'app/search/Search.featuresFound',
                searchStarted: 'app/search/Search.searchStarted',
                searchError: 'app/search/Search.searchError',
                clear: 'app/search/Search.clear',
                identify: 'app/search/identify',
                onStreamSelect: 'app/search/onStreamSelect'
            },
            appResultLayer: {
                addLayer: 'app/search/ResultLayer.addLayer',
                removeLayer: 'app/search/ResultLayer.removeLayer',
                highlightFeature: 'app/search/ResultLayer.highlightFeature',
                clearSelection: 'app/search/ResultLayer.clearSelection',
                identifyFeature: 'app/search/ResultLayer.identifyFeature'
            },
            appSearchIdentifyPane: {
                backToResults: 'app/search/IdentifyPane.backToResults'
            },
            app: {
                hideGrid: 'app/App.hideGrid',
                showGrid: 'app/App.showGrid',

                // matches topic name in ijit/widgets/authentication/LoginRegister
                onSignInSuccess: 'LoginRegister/sign-in-success'
            },
            appSearchResultsGrid: {
                downloadFeaturesDefined: 'app/search/ResultsGrid.downloadFeaturesDefined'
            },
            appDownloadDownload: {
                clearSelection: 'app/download/Download.clearSelection'
            }
        },

        // urls: Object
        //      Urls for the project
        urls: {
            UtahPLSS: 'https://tiles.arcgis.com/tiles/99lidPhWCzftIe9K/arcgis/rest/services/UtahPLSS/VectorTileServer',
            DEQEnviro: deqServiceFolder + '/MapService/MapServer',
            json: 'webdata/DEQEnviro.json',
            secure: secureUrl,
            search: location.pathname.replaceAll(/(src|dist|-v1)/g, '') + 'api/search',
            download: deqServiceFolder + '/Toolbox/GPServer/Download',
            printProxy: 'https://print.agrc.utah.gov/14/arcgis/rest/services/GPServer/export',
            landOwnership: 'https://gis.trustlands.utah.gov/server/' +
                           'rest/services/Ownership/UT_SITLA_Ownership_LandOwnership_WM/MapServer',
            parcels: 'https://tiles.arcgis.com/tiles/99lidPhWCzftIe9K/arcgis/rest/services/StatewideParcels/VectorTileServer',

            // AGOL Item: https://utahdeq.maps.arcgis.com/home/item.html?id=24c7e34093d24563ba360fa46f67317b
            environmentalCovenants: 'https://services2.arcgis.com/NnxP4LZ3zX8wWmP9/ArcGIS/rest/services/Utah_DEQ_Environmental_Covenants/FeatureServer'
        },

        // layerIndices: Object
        //      Indices of layers within map services.
        layerIndices: {
            streams: 0,
            huc: 1,
            searchStreams: 2,
            environmentalCovenants: 0, // in the DEQ AGOL Service
            landOwnership: 0 // in the SITLA service
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
                UNIQUE_ID: 'UNIQUE_ID',
                ENVIROAPPLABEL: 'ENVIROAPPLABEL',
                ENVIROAPPSYMBOL: 'ENVIROAPPSYMBOL',
                OBJECTID: 'OBJECTID'
            },
            searchStreams: {
                GNIS_Name: 'GNIS_Name',
                COUNTY: 'COUNTY'
            },
            nhd: {
                FCode: 'FCode',
                GNIS_Name: 'GNIS_Name'
            },
            zip: {
                ZIP5: 'ZIP5'
            }
        },

        // featureClassNames: {}
        featureClassNames: {
            counties: 'SGID10.BOUNDARIES.Counties',
            utah: 'SGID10.BOUNDARIES.Utah',
            city: 'SGID10.BOUNDARIES.Municipalities_Carto', // _Carto version to make sure that Draper is not split on county line
            zip: 'SGID10.BOUNDARIES.ZipCodes'
        },

        // TRSMinScaleLevel: Number
        //      The minimum scale level that the TRS Layer will draw.
        TRSMinScaleLevel: 10,

        // NHDMinScaleLevel: Number
        //      The minimum scale level that the nhd layer will draw.
        NHDMinScaleLevel: 13,

        // parcelsMinScaleLevel: Number
        //      The minimum scale level that the nhd layer will draw.
        parcelsMinScaleLevel: 15,

        // appJson: Object
        //      Cache for data returned by getAppJson
        appJson: null,

        // queryLayerNames: Object
        //      Lookup for query layer name by layer index
        //      Populated in getAppJson below
        queryLayerNames: null,

        // spatialReference SpatialReference
        //      The spatial reference of the map
        spatialReference: new SpatialReference(3857),

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
            resultSymbolOpacity: 0.65,
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
                    12,
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

        parameterNames: {
            output: 'output' // download service
        },

        getAppJson: function () {
            // summary:
            //      requests the DEQEnviro.json data and returns it, caches the results for future requests
            console.log('app.config::getAppJson', arguments);

            var def = new Deferred();

            if (this.appJson) {
                def.resolve(this.appJson);
            } else if (this.appJsonRequest) {
                // prevent simultaneous requests
                this.appJsonRequest.then(() => {
                    def.resolve(this.appJson);
                });
            } else {
                // get a fresh copy of the json file on each load
                this.appJsonRequest = xhr(`${this.urls.json}?rel=${window.AGRC.version}`, {
                    handleAs: 'json'
                }).then((json) => {
                    this.queryLayerNames = {};
                    json.queryLayers.forEach((ql) => {
                        this.queryLayerNames[ql.index] = ql.name;
                    });
                    this.appJsonRequest = null;
                    def.resolve(this.appJson = json);
                });
            }

            return def.promise;
        },
        getQueryLayerByIndex: function (index) {
            // summary:
            //      description
            // index: String
            // console.log('app/config:getQueryLayerByIndex', arguments);

            return this.getDatasetByIndex(this.appJson.queryLayers, index);
        },
        getRelatedTableByIndex: function (index) {
            // summary:
            //      description
            // index: String
            // console.log('app/config:getRelatedTableByIndex', arguments);

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
                if (ql.index === index) {
                    returnLayer = ql;

                    return true;
                }

                return false;
            });

            this._cached[index] = returnLayer;

            return returnLayer;
        }
    });

    return window.AGRC;
});
