define([
    'app/config',
    'app/map/MapController',

    'dojo/Deferred',
    'dojo/topic',
    'dojo/_base/declare',

    'esri/config',
    'esri/tasks/BufferParameters',
    'esri/tasks/GeometryService'
], function (
    config,
    mapController,

    Deferred,
    topic,
    declare,

    esriConfig,
    BufferParameters,
    GeometryService
) {
    return declare(null, {
        // summary:
        //      mixin for searchs that have buffers

        // noBufferMsg: String
        //      shown when the user draws a line or point without defining a buffer radius
        noBufferMsg: 'You must enter a buffer radius greater than zero!',

        // geoService: GeometryService
        //      used to buffer points and lines
        geoService: null,

        // getGeometryDef: Deferred
        //      the deferred returned from getGeometry
        getGeometryDef: null,

        getGeometry() {
            // summary:
            //      gets the geometry to send to the search service
            // returns: Promise
            console.log('app/search/_BufferMixin:getGeometry', arguments);

            this.getGeometryDef = new Deferred();

            if (!this.geometry && mapController.selectedGraphic) {
                this.geometry = mapController.selectedGraphic.geometry;
            }

            if (this.geometry) {
                if (this.bufferNum.value > 0) {
                    // start spinner
                    topic.publish(config.topics.appSearch.searchStarted);
                    if (!this.geoService) {
                        this.initGeoService();
                    }
                    this.bufferParams.distances = [this.bufferNum.value];
                    this.bufferParams.geometries = [this.geometry];
                    this.geoService.buffer(this.bufferParams);
                } else if (this.geometry.type === 'polygon') {
                    this.getGeometryDef.resolve(this.geometry);
                } else {
                    this.getGeometryDef.reject(this.noBufferMsg);
                }
            } else {
                this.getGeometryDef.reject(this.noGeoMsg);
            }

            return this.getGeometryDef.promise;
        },
        initGeoService() {
            // summary:
            //      sets up the geometry service
            console.log('app/search/_BufferMixin:initGeoService', arguments);

            var that = this;
            this.geoService = esriConfig.defaults.geometryService;
            this.geoService.on('buffer-complete', function (result) {
                that.getGeometryDef.resolve(result.geometries[0]);
                topic.publish(config.topics.appMapMapController.zoomToSearchGraphic, result.geometries[0]);
            });
            this.geoService.on('error', function () {
                that.getGeometryDef.reject('There was an error with the buffer');
            });

            this.bufferParams = new BufferParameters();
            this.bufferParams.spatialReference = config.spatialReference;
            this.bufferParams.unit = GeometryService.UNIT_STATUTE_MILE;
            this.bufferParams.geodesic = true;
        },
        clear() {
            // summary:
            //      clears the buffer text box
            console.log('app/search/_BufferMixin:clear', arguments);

            topic.publish(config.topics.appMapMapController.clearGraphics);

            this.bufferNum.value = '';
        }
    });
});
