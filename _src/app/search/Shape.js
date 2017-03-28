define([
    'app/config',
    'app/map/MapController',
    'app/search/_BufferMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-class',
    'dojo/has',
    'dojo/query',
    'dojo/text!./templates/Shape.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/toolbars/draw'
], function (
    config,
    mapController,
    _BufferMixin,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domClass,
    has,
    query,
    template,
    topic,
    declare,
    lang,

    Draw
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _BufferMixin], {
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

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.search.Shape::postCreate', arguments);

            this.toolbar = new Draw(mapController.map);

            query('.btn-group .btn', this.domNode)
                .on('click', lang.hitch(this, 'onToolBtnClick'));

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

            this.toolbar.deactivate();

            this.unselectBtns();

            return this.inherited(arguments);
        },
        clear: function () {
            // summary:
            //      clears graphics, disables active tool and unactivates any buttons
            console.log('app/search/Shape:clear', arguments);

            this.toolbar.deactivate();

            this.unselectBtns();

            this.inherited(arguments);
        },
        unselectBtns: function () {
            // summary:
            //      unselects all buttons in the widget
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
