define([
    'app/config',
    'app/map/MapController',
    'app/map/ReferenceLayerToggle',
    'app/map/ScaleDependentReferenceLayerToggle',
    'app/_PopoverMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-construct',
    'dojo/text!./templates/MapLayersPopover.html',
    'dojo/_base/declare',

    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/FeatureLayer',
    'esri/layers/VectorTileLayer'
], function (
    config,
    MapController,
    ReferenceLayerToggle,
    ScaleDependentReferenceLayerToggle,
    _PopoverMixin,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domConstruct,
    template,
    declare,

    ArcGISDynamicMapServiceLayer,
    FeatureLayer,
    VectorTileLayer
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _PopoverMixin], {
        // description:
        //      Popover that is toggled by the "Map Layers" map button.
        //      Contains controls to allow the user to toggle reference and base map layers.

        templateString: template,
        baseClass: 'map-layers-popover',
        widgetsInTemplate: true,


        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app/map/MapLayersPopover::postCreate', arguments);

            this.own(
                new ScaleDependentReferenceLayerToggle({
                    layerName: 'NHD Streams',
                    mapServiceUrl: config.urls.DEQEnviro,
                    layerIndex: config.layerIndices.streams,
                    minScaleLevel: config.NHDMinScaleLevel,
                    layerClass: ArcGISDynamicMapServiceLayer,
                    showLegend: true
                    // I tried using a FeatureLayer for this layer but Mark's symbology (which
                    // he feels very strongly about) didn't transfer over.
                }, domConstruct.create('div', {}, this.domNode, 'first')),
                new ReferenceLayerToggle({
                    layerName: 'Land Ownership',
                    mapServiceUrl: config.urls.landOwnership,
                    layerIndex: config.layerIndices.landOwnership,
                    layerProps: { opacity: 0.7 },
                    layerClass: ArcGISDynamicMapServiceLayer,
                    showLegend: true
                }, domConstruct.create('div', {}, this.domNode, 'first')),
                new ReferenceLayerToggle({
                    layerName: 'Hydrologic Units (HUC8)',
                    mapServiceUrl: config.urls.DEQEnviro,
                    layerIndex: config.layerIndices.huc,
                    layerClass: ArcGISDynamicMapServiceLayer,
                    layerProps: { opacity: 0.7 }
                }, domConstruct.create('div', {}, this.domNode, 'first')),
                new ScaleDependentReferenceLayerToggle({
                    layerName: 'Township/Range/Section',
                    mapServiceUrl: config.urls.UtahPLSS,
                    layerClass: VectorTileLayer,
                    minScaleLevel: config.TRSMinScaleLevel
                }, domConstruct.create('div', {}, this.domNode, 'first')),
                new ReferenceLayerToggle({
                    layerName: 'Environmental Covenants',
                    mapServiceUrl: config.urls.environmentalCovenants,
                    layerIndex: config.layerIndices.environmentalCovenants,
                    layerProps: { opacity: 0.7 },
                    layerClass: FeatureLayer,
                    showLegend: true
                }, domConstruct.create('div', {}, this.domNode, 'first')),
                new ScaleDependentReferenceLayerToggle({
                    layerName: 'Parcels',
                    mapServiceUrl: config.urls.parcels,
                    layerClass: VectorTileLayer,
                    minScaleLevel: config.parcelsMinScaleLevel
                }, domConstruct.create('div', {}, this.domNode, 'first'))
            );

            this.inherited(arguments);
        }
    });
});
