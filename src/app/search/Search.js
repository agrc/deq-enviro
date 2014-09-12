define([
    'dojo/text!./templates/Search.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/dom-construct',
    'dojo/topic',
    'dojo/request',
    'dojo/aspect',
    'dojo/query',
    'dojo/dom-class',
    'dojo/dom-attr',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/registry',

    'ijit/modules/_ErrorMessageMixin',

    'app/_CollapsibleMixin',
    'app/search/QueryLayer',
    'app/search/QueryLayerHeader',
    'app/search/Address',
    'app/search/City',
    'app/search/County',
    'app/search/SiteName',
    'app/search/ID',
    'app/search/Shape',
    'app/config',
    'app/map/MapController',
    'app/download/Download',

    'lodash'

], function(
    template,

    declare,
    array,
    lang,
    domConstruct,
    topic,
    request,
    aspect,
    query,
    domClass,
    domAttr,

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
    MapController,
    Download,

    _
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

        // download: Download
        download: null,

        // searchServiceErrorMsg: String
        searchServiceErrorMsg: 'There was an error with the search service!',

        // noQueryLayersSelectedErrMsg: String
        noQueryLayersSelectedErrMsg: 'You must select at least one query layer!',

        // noSearchTypeSelectedErrMsg: String
        noSearchTypeSelectedErrMsg: 'You must select a search criteria type!',


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

            var showBtn = function (btn) {
                query('.grid-btn', this.domNode).addClass('hidden');
                domClass.remove(btn, 'hidden');
            };
            this.own(
                this.address = new Address({
                    apiKey: config.apiKey
                }, this.addressPane),
                this.city = new City({
                    map: MapController.map,
                    promptMessage: 'please begin typing a city name',
                    mapServiceURL: config.urls.terrain,
                    searchLayerIndex: config.layerIndices.city,
                    searchField: config.fieldNames.cities.NAME,
                    placeHolder: 'city name...',
                    maxResultsToDisplay: 5,
                    symbolFill: config.symbols.zoom.polygon,
                    graphicsLayer: MapController.map.graphics,
                    preserveGraphics: true
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
                topic.subscribe(config.topics.appWizard.showResults, lang.hitch(this, 'search')),
                topic.subscribe(config.topics.app.showGrid, _.partial(showBtn, this.hideGridBtn)),
                topic.subscribe(config.topics.app.hideGrid, _.partial(showBtn, this.showGridBtn)),
                this.download = new Download({}, this.downloadDiv)
            );

            this.childWidgets = [this.address, this.city, this.county, this.shape, this.download];

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
        
            // clear previous pane
            if (this.currentPane && this.currentPane.clear) {
                this.currentPane.clear();
            }

            // switch to new pane
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
                request(config.urls.search, {
                    method: 'POST',
                    data: JSON.stringify(params),
                    headers: {'Content-Type': 'application/json'},
                    handleAs: 'json',
                    timeout: 40000
                }).then(
                    function (response) {
                        if (response.status !== 200) {
                            topic.publish(config.topics.appSearch.searchError);
                            onError(that.searchServiceErrorMsg);
                        } else {
                            topic.publish(config.topics.appSearch.featuresFound, response.result);
                            topic.publish(config.topics.app.showGrid);
                            that.hideLoader();
                        }
                    },
                    function () {
                        topic.publish(config.topics.appSearch.searchError);
                        onError(that.searchServiceErrorMsg);
                    }
                );
                topic.publish(config.topics.appSearch.searchStarted);
            };
            var onError = function (errTxt) {
                that.showErrMsg(errTxt);
                that.hideLoader();
            };

            this.hideErrMsg();

            this.showLoader();

            // check for no search type selected
            if (!this.currentPane) {
                onError(this.noSearchTypeSelectedErrMsg);
                return;
            }

            if (this.currentPane.getGeometry) {
                // search type requires an async process to get geometry
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
                // search type just has a value to pass to the search service (ID & Name searches)
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
        },
        clear: function () {
            // summary:
            //      clears all of the search parameters and query layers
            console.log('app/search/Search:clear', arguments);

            this.hideGrid();
            query('.grid-btn', this.domNode).addClass('hidden');

            if (this.currentPane) {
                this.currentPane.clear();
            }

            topic.publish(config.topics.appSearch.clear);

            this.hideErrMsg();
            this.select.value = 'empty';
            this.onSelectChange();
        },
        hideGrid: function () {
            // summary:
            //      description
            console.log('app/search/Search:hideGrid', arguments);
        
            topic.publish(config.topics.app.hideGrid);
        },
        showGrid: function () {
            // summary:
            //      description
            console.log('app/search/Search:showGrid', arguments);
        
            topic.publish(config.topics.app.showGrid);
        },
        showLoader: function () {
            // summary:
            //      description
            console.log('app/download/Download:showLoader', arguments);
        
            domAttr.set(this.searchBtn, 'disabled', true);
            this.searchBtn.innerHTML = 'Searching';
        },
        hideLoader: function () {
            // summary:
            //      description
            console.log('app/download/Download:hideLoader', arguments);
        
            domAttr.set(this.searchBtn, 'disabled', false);
            this.searchBtn.innerHTML = 'Search';
        }
    });
});
