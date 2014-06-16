define([
    'dojo/_base/declare',
    'dojo/Deferred',
    'dojo/aspect',

    'agrc/widgets/locate/MagicZoom'
], function(
    declare,
    Deferred,
    aspect,

    MagicZoom
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