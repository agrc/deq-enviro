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
                    // he feels very stongly about) didn't transfer over.
                }, domConstruct.create('div', {}, this.domNode, 'first')),
                new ReferenceLayerToggle({
                    layerName: 'Environmental Risk of UST Facilities',
                    mapServiceUrl: config.urls.DEQEnviro,
                    layerIndex: config.layerIndices.risk.facilities,
                    showLegend: true,
                    layerClass: ArcGISDynamicMapServiceLayer,
                    legendHeader: 'TankRiskAverageTest'
                }, domConstruct.create('div', {}, this.domNode, 'first')),
                new ScaleDependentReferenceLayerToggle({
                    layerName: 'Environmental Risk Water Points',
                    mapServiceUrl: config.urls.DEQEnviro,
                    layerIndex: config.layerIndices.risk.waterPoints,
                    layerProps: { opacity: 0.4 },
                    showLegend: true,
                    layerClass: ArcGISDynamicMapServiceLayer,
                    minScaleLevel: config.RiskLayersMinScaleLevel
                }, domConstruct.create('div', {}, this.domNode, 'first')),
                new ScaleDependentReferenceLayerToggle({
                    layerName: 'Environmental Risk Streams',
                    mapServiceUrl: config.urls.DEQEnviro,
                    layerIndex: config.layerIndices.risk.streams,
                    layerProps: { opacity: 0.4 },
                    showLegend: true,
                    layerClass: ArcGISDynamicMapServiceLayer,
                    minScaleLevel: config.RiskLayersMinScaleLevel
                }, domConstruct.create('div', {}, this.domNode, 'first')),
                new ScaleDependentReferenceLayerToggle({
                    layerName: 'Environmental Risk Lakes',
                    mapServiceUrl: config.urls.DEQEnviro,
                    layerIndex: config.layerIndices.risk.lakes,
                    layerProps: { opacity: 0.4 },
                    showLegend: true,
                    layerClass: ArcGISDynamicMapServiceLayer,
                    minScaleLevel: config.RiskLayersMinScaleLevel
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
                    mapServiceUrl: config.urls.DEQEnviro,
                    layerIndex: config.layerIndices.environmentalCovenants,
                    layerProps: { opacity: 0.7 },
                    showLegend: true,
                    layerClass: ArcGISDynamicMapServiceLayer,
                    legendHeader: 'DIVISION, BRANCH, PROGRAM'
                }, domConstruct.create('div', {}, this.domNode, 'first'))
            );

            this.inherited(arguments);
        }
    });
});
