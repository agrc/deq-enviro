define([
    'dojo/text!./templates/Shape.html',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/query',
    'dojo/dom-class',
    'dojo/topic',
    'dojo/Deferred',
    'dojo/has',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'esri/toolbars/draw',
    'esri/tasks/GeometryService',
    'esri/tasks/BufferParameters',

    '../map/MapController',
    '../config'
], function(
    template,

    declare,
    lang,
    query,
    domClass,
    topic,
    Deferred,
    has,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    Draw,
    GeometryService,
    BufferParameters,

    MapController,
    config
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      Controls and tools for defining a search area by drawing on the map.

        templateString: template,
        baseClass: 'shape pad',
        widgetsInTemplate: true,

        // toolbar: Draw
        //      esri Draw toolbar class
        toolbar: null,

        // geometry: esri/geometry
        //      The last geometry to be drawn.
        //      Could be point, line or polygon
        geometry: null,

        // noGeoMsg: String
        //      shown when the user clicks search before defining a geometry
        noGeoMsg: 'You must draw a shape first!',

        // noBufferMsg: String
        //      shown when the user draws a line or point without defining a buffer radius
        noBufferMsg: 'You must enter a buffer radius greater than zero!',

        // geoService: GeometryService
        //      used to buffer points and lines
        geoService: null,

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.search.Shape::postCreate', arguments);

            this.toolbar = new Draw(MapController.map);

            query('.btn-group .btn', this.domNode)
                .onclick(lang.hitch(this, 'onToolBtnClick'));

            this.own(
                this.toolbar.on('draw-complete', lang.hitch(this, 'onDrawComplete'))
            );

            this.inherited(arguments);
        },
        onToolBtnClick: function (evt) {
            // summary:
            //      fires when a user clicks on a button on the toolbar
            // evt: Click Event
            console.log('app/search/Shape::onToolBtnClick', arguments);

            topic.publish(config.topics.appMapMapController.clearGraphics);
            this.unselectBtns();
            domClass.add(evt.target, 'active');
            this.toolbar.activate(evt.target.value);
            this.geometry = null; // prevent search getting old geometries.

            // show finish button for touch devices only
            if (has('touch') &&
                (evt.target.value === 'polygon' || evt.target.value === 'polyline')) {
                domClass.remove(this.finishBtn, 'hidden');
            }
        },
        onDrawComplete: function (evt) {
            // summary:
            //      Fires when the user completes a drawing
            // evt: Event Object
            console.log('app/search/Shape::onDrawComplete', arguments);

            topic.publish(config.topics.appMapMapController.graphic, evt.geometry);
            this.geometry = evt.geometry;
        },
        getGeometry: function () {
            // summary:
            //      gets the geometry to send to the search service
            // returns: Promise
            console.log('app/search/Shape::getGeometry', arguments);

            this.getGeometryDef = new Deferred();

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

            this.toolbar.deactivate();

            this.unselectBtns();

            return this.getGeometryDef.promise;
        },
        initGeoService: function () {
            // summary:
            //      sets up the geometry service
            console.log('app/search/Shape::initGeoService', arguments);

            var that = this;
            this.geoService = new GeometryService(config.urls.geometryService);
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
        },
        clear: function () {
            // summary:
            //      clears graphics, disables active tool and unactivates any buttons
            console.log('app/search/Shape:clear', arguments);

            topic.publish(config.topics.appMapMapController.clearGraphics);

            this.toolbar.deactivate();

            this.unselectBtns();

            this.bufferNum.value = '';
        },
        unselectBtns: function () {
            // summary:
            //      unselectes all buttons in the widget
            console.log('app/search/Shape:unselectBtns', arguments);

            query('.btn-group .btn', this.domNode)
                .forEach(function (btn) {
                    domClass.remove(btn, 'active');
                });

            domClass.add(this.finishBtn, 'hidden');
        },
        onFinishClick: function () {
            // summary:
            //      User clicked on the finish drawing button (touch only)
            console.log('app/search/Shape:onFinishClick', arguments);

            this.toolbar.finishDrawing();
        }
    });
});