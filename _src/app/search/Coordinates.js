define([
    'agrc/widgets/locate/ZoomToCoords',

    'app/config',
    'app/map/MapController',
    'app/search/_BufferMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/query',
    'dojo/text!app/search/templates/Coordinates.html',
    'dojo/_base/declare',

    'esri/graphic',
    'esri/layers/GraphicsLayer'
], function (
    ZoomToCoords,

    config,
    MapController,
    _BufferMixin,

    _TemplatedMixin,
    _WidgetBase,

    query,
    template,
    declare,

    Graphic,
    GraphicsLayer
) {
    return declare([_WidgetBase, _TemplatedMixin, _BufferMixin], {
        // description:
        //      Search by inputting coordinates and a buffer distance
        templateString: template,
        baseClass: 'coordinates',

        // noGeoMsg: String
        //      displayed if the user clicks on search before zooming to a point
        noGeoMsg: 'You must zoom to a point first!',

        // graphicsLayer: GraphicsLayer
        //      the graphics layer that the coordinates graphic is stored in
        graphicsLayer: null,

        // zoomToCoords: ZoomToCoords
        //      widget for zoom to coordinates
        zoomToCoords: null,


        postCreate() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.log('app/search/Coordinates:postCreate', arguments);

            this.graphicsLayer = new GraphicsLayer();
            MapController.map.addLayer(this.graphicsLayer);

            this.zoomToCoords = new ZoomToCoords({
                map: MapController.map
            }, this.zoomToCoordsDiv);
            this.zoomToCoords.startup();

            this.own(
                this.zoomToCoords,
                this.zoomToCoords.on('zoom', this.onZoomed.bind(this))
            );

            this.inherited(arguments);
        },
        onZoomed(evt) {
            // summary:
            //      the ZoomToCoords widget has found a point and zoomed to it on the map
            // evt: Event object with point property
            console.log('app/search/Coordinates:onZoomed', arguments);

            this.geometry = evt.point;

            this.graphicsLayer.add(new Graphic(this.geometry, config.symbols.zoom.point));
        },
        clear() {
            // summary:
            //      clears the point graphics and text boxes
            console.log('app/search/Coordinates:clear', arguments);

            this.graphicsLayer.clear();

            this.geometry = null;

            query('input[data-required="true"]', this.zoomToCoords.domNode).forEach((node) => {
                node.value = '';
            });

            this.inherited(arguments);
        }
    });
});
