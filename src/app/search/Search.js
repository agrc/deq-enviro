define([
    'dojo/text!./templates/Search.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
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
    lang,
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

        // childWidgets: _WidgetBase[]
        //      widgets to call startup on
        childWidgets: null,

        // currentPane: ContentPane
        //      the currently selected search pane
        currentPane: null,

        // address: Address
        address: null,

        // city: City
        city: null,

        // county: County
        county: null,

        // shape: Shape
        shape: null,

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
                this.address = new Address({
                    apiKey: config.apiKey
                }, this.addressPane),
                this.city = new City({}, this.cityPane),
                this.county = new County({}, this.countyPane),
                this.shape = new Shape({}, this.shapePane),
                topic.subscribe(config.topics.appWizard.showSearch, function () {
                    $(that.locationPanel).collapse('show');
                }),
                topic.subscribe(config.topics.appWizard.showQueryLayers, function () {
                    $(that.queryLayersPanel).collapse('show');
                }),
                topic.subscribe(config.topics.appWizard.showResults, lang.hitch(this, 'search'))
            );

            this.childWidgets = [this.address, this.city, this.county, this.shape];

            this.inherited(arguments);
        },
        startup: function () {
            // summary:
            //      startup
            console.log('app/search/Search::startup', arguments);
        
            array.forEach(this.childWidgets, function (w) {
                w.startup();
            });

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
        
            this.currentPane = this[this.select.value];
            this.stackContainer.selectChild(this.currentPane);
        },
        search: function () {
            // summary:
            //      description
            console.log('app/Search::search', arguments);
        
            // TODO: handles reject error messages.
            this.address.getGeometry().then(function (geo) {
                console.log('geo', geo);
            });
        }
    });
});