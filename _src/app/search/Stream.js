define([
    'app/config',
    'app/map/MapController',
    'app/search/_BufferMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/Deferred',
    'dojo/text!app/search/templates/Stream.html',
    'dojo/topic',
    'dojo/_base/declare',

    'esri/layers/GraphicsLayer',

    'sherlock/providers/MapService',
    'sherlock/Sherlock'
], function (
    config,
    MapController,
    _BufferMixin,

    _TemplatedMixin,
    _WidgetBase,

    Deferred,
    template,
    topic,
    declare,

    GraphicsLayer,

    MapService,
    Sherlock
) {
    return declare([_WidgetBase, _TemplatedMixin, _BufferMixin], {
        // description:
        //      Search by GNIS stream name and buffer.
        templateString: template,
        baseClass: 'stream',

        // geometry: Polyline
        //      the selected strean
        geometry: null,

        // noGeoMsg: String
        //      shown if the user has not selected a stream
        noGeoMsg: 'You must find a stream first!',

        // graphicsLayer: GraphicsLayer
        //      the graphics layer that the search graphics are stored in
        graphicsLayer: null,

        // sherlock: Sherlock
        //      search widget for streams
        sherlock: null,

        postCreate() {
            // summary:
            //      Overrides method of same name in dijit/_Widget.
            console.log('app/search/Stream:postCreate', arguments);

            this.graphicsLayer = new GraphicsLayer();
            MapController.map.addLayer(this.graphicsLayer);

            var provider = new MapService(
                `${config.urls.DEQEnviro}/${config.layerIndices.searchStreams}`,
                config.fieldNames.searchStreams.GNIS_Name,
                { contextField: config.fieldNames.searchStreams.COUNTY }
            );
            this.sherlock = new Sherlock({
                provider,
                map: MapController.map,
                promptMessage: 'begin typing a stream name',
                maxResultsToDisplay: 10,
                placeHolder: 'stream name...',
                graphicsLayer: this.graphicsLayer,
                preserveGraphics: true
            }, this.sherlockDiv);

            this.own(
                this.sherlock,
                this.sherlock.on('zoomed', this.onZoomed.bind(this))
            );

            this.inherited(arguments);
        },
        onZoomed(graphic) {
            // summary:
            //      callback for when sherlock zooms to a stream
            // graphic: Graphic
            console.log('app/search/Stream:onZoomed', arguments);

            this.geometry = graphic.geometry;
        },
        clear() {
            // summary:
            //      clear the streams graphic
            console.log('app/search/Stream:clear', arguments);

            this.graphicsLayer.clear();

            this.sherlock.textBox.value = '';

            this.inherited(arguments);
        }
    });
});
