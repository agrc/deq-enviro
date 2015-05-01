define([
    'dojo/text!./templates/ReferenceLayerToggle.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/topic',
    'dojo/dom-construct',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    './Legend',
    '../config'

], function(
    template,

    declare,
    array,
    topic,
    domConstruct,

    _WidgetBase,
    _TemplatedMixin,

    Legend,
    config
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Provides controls for the user to show/hide a reference layer on the map. 
        //      Can handle stand-alone services or individual layers within a service.

        templateString: template,
        baseClass: 'reference-layer-toggle',

        // layer: esri/layers/Layer
        //      The map service layer associated with this widget
        layer: null,

        // topics: Object
        //      The topic names related to this widget
        topics: config.topics.appMapReferenceLayerToggle,


        // Properties to be sent into constructor

        // layerName: String
        //      The name of the layer that will show up next to the checkbox
        layerName: null,

        // mapServiceUrl: String
        //      The Url to the map service associated with this widget
        mapServiceUrl: null,

        // layerIndex: Number [optional]
        //      The index number of the layer within the map service that you want this
        //      widget to be associated with
        layerIndex: null,

        // tiledService: Boolean [optional]
        //      True is the layer is a tile map service. Defaults to false.
        tiledService: null,

        // layerProps: Object [optional]
        //      Properites to be passed in to the layer constructor
        layerProps: null,

        // showLegend: Boolean
        //      controls the visibility of the legend popup control
        showLegend: false,

        // legendHeader: String (optional)
        //      passed to legend widget
        legendHeader: null,

        postCreate: function() {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app/map/ReferenceLayerToggle::postCreate', arguments);

            if (this.showLegend) {
                this.legend = new Legend({
                    mapServiceUrl: this.mapServiceUrl,
                    layerId: this.layerIndex,
                    header: this.legendHeader
                });
                this.legend.startup();
            } else {
                domConstruct.destroy(this.legendTip);
            }

            this.inherited(arguments);
        },
        onCheckboxChange: function () {
            // summary:
            //      Fired when the user toggles the checkbox
            console.log('app/map/ReferenceLayerToggle:onCheckboxChange', arguments);
        
            topic.publish(
                this.topics.addLayer,
                this.mapServiceUrl,
                this.tiledService,
                this.layerIndex,
                this.layerProps
            );

            topic.publish(this.topics.toggleLayer, this.mapServiceUrl, this.layerIndex, this.checkbox.checked);
        },
        displayLegend: function () {
            // summary:
            //      Have to re-initialize the legend each time because it's destroyed
            //      when the MapLayersPopover is closed. Not sure why.
            console.log('app/map/ReferenceLayerToggle:displayLegend', arguments);
        
            $(this.legendTip).tooltip({
                title: this.legend.domNode,
                html: true,
                placement: 'auto',
                delay: config.popupDelay,
                trigger: 'manual',
                container: 'body'
            }).tooltip('show');
        },
        hideLegend: function () {
            // summary:
            //      description
            console.log('app/map/ReferenceLayerToggle:hideLegend', arguments);
        
            $(this.legendTip).tooltip('hide');
        }
    });
});
