define([
    'agrc/widgets/locate/MagicZoom',

    'app/config',

    'dojo/aspect',
    'dojo/Deferred',
    'dojo/_base/declare'
], function (
    MagicZoom,

    config,

    aspect,
    Deferred,
    declare
) {
    return declare([MagicZoom], {
        // description:
        //      Wrapper around MagicZoom to implement getGeometry

        baseClass: 'magic-zoom pad',

        // geometry: esri/geometry/Polygon
        //      The most recently zoomed to geometry
        geometry: null,

        // validationMsg: String
        validationMsg: 'Please select a city!',

        apiKey: config.apiKey,
        wkid: config.spatialReference.wkid,
        promptMessage: 'please begin typing a city name',
        searchLayer: config.featureClassNames.city,
        searchField: config.fieldNames.cities.NAME,
        placeHolder: 'city name...',
        maxResultsToDisplay: 5,
        symbolFill: config.symbols.zoom.polygon,
        preserveGraphics: true,

        postCreate: function () {
            // summary:
            //      wires up onZoomed listener
            console.log('app/search/City::postCreate', arguments);

            var that = this;

            this.own(aspect.after(this, 'onZoomed', function (graphic) {
                that.geometry = graphic.geometry;
            }, true));

            this.inherited(arguments);
        },
        getGeometry: function () {
            // summary:
            //      Called by Search
            // returns: Promise
            console.log('app/search/City::getGeometry', arguments);

            var def = new Deferred();

            if (this.geometry) {
                def.resolve(this.geometry);
            } else {
                def.reject(this.validationMsg);
            }

            return def.promise;
        },
        clear: function () {
            // summary:
            //      clears the text box and any related graphics
            console.log('app/search/City:clear', arguments);

            this.textBox.value = '';

            this.graphicsLayer.clear();
        }
    });
});
