define([
    'app/config',

    'agrc/widgets/locate/FindAddress',

    'dojo/aspect',
    'dojo/Deferred',
    'dojo/text!./resources/Address.html',
    'dojo/topic',
    'dojo/_base/declare',

    'esri/config',
    'esri/geometry/Point',
    'esri/tasks/BufferParameters',
    'esri/tasks/GeometryService'
], function (
    config,

    FindAddress,

    aspect,
    Deferred,
    template,
    topic,
    declare,

    esriConfig,
    Point,
    BufferParameters,
    GeometryService
) {
    return declare([FindAddress], {
        // description:
        //      Street address controls and logic.

        baseClass: 'find-address pad',
        templateString: template,

        // geometryService: GeometryService
        geometryService: null,

        // getGeometryDef: Deferred
        getGeometryDef: null,

        // validationMsg: String
        validationMsg: 'Missing values!',

        zoomLevel: 17,
        wkid: config.spatialReference.wkid,
        apiKey: config.apiKey,

        postCreate: function () {
            // summary:
            //      description
            console.log('app/search/Address::postCreate', arguments);

            var that = this;

            aspect.after(this, 'onFind', this.buffer, true);
            aspect.after(this, '_onError', function () {
                that.getGeometryDef.reject('There was an error with the find address service.');
            });

            this.inherited(arguments);
        },
        getGeometry: function () {
            // summary:
            //      called by Search
            // returns: dojo/promise/Promise
            //      Promise is resolved with a esri/geometry/Polygon object
            console.log('app/search/Address::getGeometry', arguments);

            this.getGeometryDef = new Deferred();

            // have to validate manually to incorporate buffer but also because
            // FindAddress:geocodeAddress is written in a way that I can't
            // tell if it validates or not.
            if (!this._validate() || !this._isValid(this.numBuffer)) {
                this.getGeometryDef.reject(this.validationMsg);
            }

            // kick off geocoding - buffer is called on successful match
            this.geocodeAddress();

            return this.getGeometryDef.promise;
        },
        buffer: function (geocodeResult) {
            // summary:
            //      Called after a successful geocode
            // geocodeResult: Object
            //      {
            //          location: {
            //              x: Number,
            //              y: Number
            //          }
            //      }
            console.log('app/search/Address:buffer', arguments);

            var that = this;

            if (!this.geometryService) {
                this.geometryService = esriConfig.defaults.geometryService;
                this.geometryService.on('buffer-complete', function (result) {
                    that.getGeometryDef.resolve(result.geometries[0]);
                    topic.publish(config.topics.appMapMapController.zoomToSearchGraphic, result.geometries[0]);
                });
                this.geometryService.on('error', function () {
                    that.getGeometryDef.reject('There was an error with the buffer.');
                });
            }

            var params = new BufferParameters();

            params.distances = [this.numBuffer.value];
            var point = new Point(
                geocodeResult.location.x,
                geocodeResult.location.y,
                config.spatialReference
            );
            params.geometries = [point];
            params.spatialReference = config.spatialReference;
            params.unit = GeometryService.UNIT_STATUTE_MILE;

            this.geometryService.buffer(params);
        },
        clear: function () {
            // summary:
            //      clears/resets text boxes
            console.log('app/search/Address:clear', arguments);

            this.txtAddress.value = '';
            this.txtZone.value = '';
            this.numBuffer.value = 1;
        }
    });
});
