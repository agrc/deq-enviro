define([
    'dojo/text!./templates/GridRowHeader.html',

    'dojo/_base/declare',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'dojox/gfx',

    'app/config'

], function(
    template,

    declare,

    _WidgetBase,
    _TemplatedMixin,

    gfx,

    config
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      The row that shows the results layer name, count and marker symbol.

        templateString: template,
        baseClass: 'grid-row-header',

        // Properties to be sent into constructor

        // name: String
        //      layer name
        name: null,

        // count: Number
        //      the total number of returned features or selected features
        count: null,

        // color: Number[]
        //      color of the marker symbol
        color: null,

        // geometryType: String
        //      point or polygon
        geometryType: null,

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.search.GridRowHeader::postCreate', arguments);

            // add opacity to color
            this.color = this.color.concat([config.symbols.resultSymbolOpacity/255]);

            var surf = gfx.createSurface(this.surfaceContainer, 14, 14);

            var shape;
            if (this.geometryType === 'point') {
                shape = surf.createCircle({
                    cx: 7,
                    cy: 7,
                    r: 5
                });
            } else {
                shape = surf.createPolyline([
                    {x: 1, y: 1},
                    {x: 13, y: 1},
                    {x: 9, y: 7},
                    {x: 13, y: 13},
                    {x: 1, y: 13},
                    {x: 1, y: 1}
                ]);
            }
            shape.setFill(this.color).setStroke('black');

            this.inherited(arguments);
        }
    });
});