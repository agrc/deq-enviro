define([
    'dojo/text!./templates/Search.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/dom-construct',
    'dojo/topic',
    'dojo/request',
    'dojo/aspect',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/registry',

    'ijit/modules/_ErrorMessageMixin',

    '../_CollapsibleMixin',
    './QueryLayer',
    './QueryLayerHeader',
    './Address',
    './City',
    './County',
    './SiteName',
    './ID',
    './Shape',
    '../config',
    '../map/MapController'

], function(
    template,

    declare,
    array,
    lang,
    domConstruct,
    topic,
    request,
    aspect,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    registry,

    _ErrorMessageMixin,

    _CollapsibleMixin,
    QueryLayer,
    QueryLayerHeader,
    Address,
    City,
    County,
    SiteName,
    ID,
    Shape,
    config,
    MapController
) {
    return declare(
        [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _CollapsibleMixin, _ErrorMessageMixin], {
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

        // site: SiteName
        site: null,

        // program: ProgramID
        program: null,

        // shape: Shape
        shape: null,

        // searchServiceErrorMsg: String
        searchServiceErrorMsg: 'There was an error with the search service!',

        // noQueryLayersSelectedErrMsg: String
        noQueryLayersSelectedErrMsg: 'You must select at least one query layer!',


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
                // this.city = new City({}, this.cityPane),
                this.city = new City({
                    map: MapController.map,
                    promptMessage: 'please begin typing a city name',
                    mapServiceURL: config.urls.terrain,
                    searchLayerIndex: config.layerIndices.city,
                    searchField: config.fieldNames.cities.NAME,
                    placeHolder: 'city name...',
                    maxResultsToDisplay: 5,
                    symbolFill: config.symbols.zoom.polygon
                }, this.cityPane),
                this.county = new County({}, this.countyPane),
                this.site = new SiteName(null, this.sitePane),
                this.id = new ID(null, this.idPane),
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
                // skip query layers that are not published to the service
                if (!ql.index) { return ; }
                
                if (!headers[ql.heading]) {
                    headers[ql.heading] = new QueryLayerHeader({
                        name: ql.heading,
                        index: ql.index
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
            this.zoomedGeometry = null;
            this.hideErrMsg();
        },
        search: function () {
            // summary:
            //      description
            console.log('app/search/Search::search', arguments);
        
            var params = {};
            var that = this;
            var makeRequest = function () {
                params.queryLayers = that.getQueryLayersParam();
                request(config.urls.api.search, {
                    method: 'POST',
                    data: JSON.stringify(params),
                    headers: {'Content-Type': 'application/json'},
                    handleAs: 'json'
                }).then(that.onSearchComplete, function () {
                    onError(that.searchServiceErrorMsg);
                });
            };
            var onError = function (errTxt) {
                that.showErrMsg(errTxt);
            };

            this.hideErrMsg();
            if (this.currentPane.getGeometry) {
                this.currentPane.getGeometry().then(
                    function (geo) {
                        try {
                            params.geometry = geo;
                            makeRequest();
                        } catch (er) {
                            onError(er);
                        }
                    },
                    onError
                );
            } else {
                try {
                    params[this.currentPane.paramName] = this.currentPane.getSearchParam();
                    makeRequest();

                } catch (er) {
                    onError(er);
                }
            }
        },
        getQueryLayersParam: function () {
            // summary:
            //      loops through the selected query layers and returns objects
            //      suitable for passing into the search api
            console.log('app/search/Search::getQueryLayersParam', arguments);
            
            if (this.selectedQueryLayers.length === 0) {
                throw this.noQueryLayersSelectedErrMsg;
            }

            return array.map(this.selectedQueryLayers, function (ql) {
                return ql.toJson();
            });
        },
        onSearchComplete: function (response) {
            // summary:
            //      callback for search service request
            // response: Object
            //      response object from server. Has status and result props
            console.log('app/search/Search:onSearchComplete', arguments);

        
            if (response.status !== 200) {
                throw this.searchServiceErrorMsg;
            }

            topic.publish(config.topics.appSearch.featuresFound, response.result);
        }
    });
});
