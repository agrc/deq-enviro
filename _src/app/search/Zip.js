define([
    'agrc/widgets/locate/MagicZoom',

    'app/config',

    'dojo/aspect',
    'dojo/Deferred',
    'dojo/topic',
    'dojo/_base/declare'
], function (
    MagicZoom,

    config,

    aspect,
    Deferred,
    topic,
    declare
) {
    return declare([MagicZoom], {
        // description:
        //      Wrapper around MagicZoom to implement getGeometry
        //      TODO: this is almost an exact copy of City.js.
        //      This could be refactored to eliminate the duplicate code.

        baseClass: 'magic-zoom pad',

        // geometry: esri/geometry/Polygon
        //      The most recently zoomed to geometry
        geometry: null,

        // validationMsg: String
        validationMsg: 'Please select a zip code!',

        apiKey: config.apiKey,
        wkid: config.spatialReference.wkid,
        promptMessage: 'please begin typing a zip code',
        searchLayer: config.featureClassNames.zip,
        searchField: config.fieldNames.zip.ZIP5,
        placeHolder: 'zip code...',
        maxResultsToDisplay: 5,
        symbolFill: config.symbols.zoom.polygon,
        preserveGraphics: true,

        getGeometry: function () {
            // summary:
            //      Called by Search
            // returns: Promise
            console.log('app/search/Zip::getGeometry', arguments);

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
            console.log('app/search/Zip:clear', arguments);

            this.textBox.value = '';

            this.graphicsLayer.clear();
        },
        _zoom: function (graphic) {
            // summary:
            //      overriden so we have control of graphics
            // graphic: Graphic
            console.log('app/search/Zip:_zoom', arguments);

            topic.publish(config.topics.appMapMapController.zoomToSearchGraphic, graphic.geometry);
            this.geometry = graphic.geometry;
        }
    });
});
