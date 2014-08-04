define([
    'dojo/text!./templates/MapLayersPopover.html',

    'dojo/_base/declare',
    'dojo/dom-construct',
    'dojo/dom-attr',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    './ReferenceLayerToggle',
    './ScaleDependentReferenceLayerToggle',
    '../config',
    './MapController',
    './BaseMapSelector'
], function(
    template,

    declare,
    domConstruct,
    domAttr,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    ReferenceLayerToggle,
    ScaleDependentReferenceLayerToggle,
    config,
    MapController,
    BaseMapSelector
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      Popover that is toggled by the "Map Layers" map button. 
        //      Contains controls to allow the user to toggle reference and base map layers.

        templateString: template,
        baseClass: 'map-layers-popover',
        widgetsInTemplate: true,


        // Properties to be sent into constructor

        // btn: DomNode
        //      The button that will toggle this popup
        btn: null,

        postCreate: function() {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app/map/MapLayersPopover::postCreate', arguments);

            $(this.btn).popover({
                content: this.domNode,
                container: 'body',
                html: true
            });
            // put original title back since bootstrap popover removes it
            // and places it in data-original-title
            this.btn.title = domAttr.get(this.btn, 'data-original-title');

            this.own(
                // needs to be loaded first before other layers are added to the map
                new BaseMapSelector({
                    map: MapController.map
                }, domConstruct.create('div', {}, this.domNode)),
                new ReferenceLayerToggle({
                    layerName: 'Indian Country and Tribal',
                    mapServiceUrl: config.urls.DEQEnviro,
                    layerIndex: 3,
                    layerProps: {opacity: 0.7},
                    showLegend: true
                }, domConstruct.create('div', {}, this.domNode, 'first')),
                new ReferenceLayerToggle({
                    layerName: 'Land Ownership',
                    mapServiceUrl: config.urls.DEQEnviro,
                    layerIndex: 0,
                    layerProps: {opacity: 0.7},
                    showLegend: true
                }, domConstruct.create('div', {}, this.domNode, 'first')),
                new ReferenceLayerToggle({
                    layerName: 'Hydrologic Units',
                    mapServiceUrl: config.urls.DEQEnviro,
                    layerIndex: 2,
                    layerProps: {opacity: 0.7}
                }, domConstruct.create('div', {}, this.domNode, 'first')),
                new ScaleDependentReferenceLayerToggle({
                    layerName: 'Township/Range/Section',
                    mapServiceUrl: config.urls.UtahPLSS,
                    tiledService: true,
                    minScaleLevel: config.TRSMinScaleLevel
                }, domConstruct.create('div', {}, this.domNode, 'first')),
                new ReferenceLayerToggle({
                    layerName: 'Environmental Covenants',
                    mapServiceUrl: config.urls.DEQEnviro,
                    layerIndex: 1,
                    layerProps: {opacity: 0.7}
                }, domConstruct.create('div', {}, this.domNode, 'first'))
            );
        }
    });
});
