define([
    'dojo/text!./templates/MeasureTool.html',

    'dojo/_base/declare',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'esri/dijit/Measurement',

    'app/_PopoverMixin'
], function(
    template,

    declare,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    Measurement,

    _PopoverMixin
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _PopoverMixin], {
        // description:
        //      Measure tool popup window.

        templateString: template,
        baseClass: 'measure-tool',
        widgetsInTemplate: true,

        // Properties to be sent into constructor

        // map: Map
        map: null,

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.map.MeasureTool::postCreate', arguments);

            var widget = new Measurement({
                map: this.map
            }, this.measureDiv);
            widget.startup();
            this.own(widget);

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.map.MeasureTool::setupConnections', arguments);

        }
    });
});