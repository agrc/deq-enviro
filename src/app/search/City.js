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

        // geometry: esri/geometry/Polygon
        //      The most recently zoomed to geometry
        geometry: null,

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

            // TODO: handle no geometry validation
            // reject with validation message?
            def.resolve(this.geometry);

            return def.promise;
        }
    });
});