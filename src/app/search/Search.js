define([
    'dojo/text!./templates/Search.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/dom-construct',
    'dojo/topic',
    'dojo/request',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    '../_CollapsibleMixin',
    './QueryLayer',
    './QueryLayerHeader',
    './Address',
    './City',
    './County',
    './Shape',
    '../config'

], function(
    template,

    declare,
    array,
    domConstruct,
    topic,
    request,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    _CollapsibleMixin,
    QueryLayer,
    QueryLayerHeader,
    Address,
    City,
    County,
    Shape,
    config
) {
    return declare(
        [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _CollapsibleMixin], {
        // description:
        //      Encapsulates the search functionality for the app.

        templateString: template,
        baseClass: 'search panel-group',
        widgetsInTemplate: true,

        // selectedQueryLayers: QueryLayer[]
        //      A list of all selected query layers.
        selectedQueryLayers: null,

        // Properties to be sent into constructor

        constructor: function () {
            // summary:
            //      description
            console.log('app/search/Search:constructor', arguments);
        
            var that = this;

            this.selectedQueryLayers = [];

            this.own(
                topic.subscribe(config.topics.appQueryLayer.addLayer, function (lyr) {
                    that.selectedQueryLayers.push(lyr);
                }),
                topic.subscribe(config.topics.appQueryLayer.removeLayer, function (lyr) {
                    that.selectedQueryLayers.splice(array.indexOf(that.selectedQueryLayers, lyr), 1);
                })
            );
        },
        postCreate: function() {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app/search/Search::postCreate', arguments);

            var that = this;
            config.getAppJson().then(function (json) {
                that.buildQueryLayers(json.queryLayers);
            });

            this.own(
                this.address = new Address({}, this.addressPane),
                this.city = new City({}, this.cityPane),
                this.county = new County({}, this.countyPane),
                this.shape = new Shape({}, this.shapePane)
            );

            this.inherited(arguments);
        },
        buildQueryLayers: function (queryLayers) {
            // summary:
            //      builds the query layer widgets and their associated panels
            // queryLayers: {}
            //      The array returned from queryLayers.json
            console.log('app/search/Search:buildQueryLayers', arguments);
        
            var headers = {};
            array.forEach(queryLayers, function (ql) {
                if (!headers[ql.heading]) {
                    headers[ql.heading] = new QueryLayerHeader({
                        name: ql.heading
                    }, domConstruct.create('div', {}, this.queryLayersContainer));
                }
                this.own(new QueryLayer(ql, domConstruct.create('div', {}, headers[ql.heading].panelBody)));
            }, this);
        },
        onSelectChange: function () {
            // summary:
            //      fires when the user changes the value of the select
            console.log('app.search.Search::onSelectChange', arguments);
        
            this.stackContainer.selectChild(this[this.select.value]);
        }
    });
});