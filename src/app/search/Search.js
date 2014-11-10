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
    'app/search/AdditionalSearch',
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
    AdditionalSearch,
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

        // additionalSearches: AdditionalSearch[]
        additionalSearches: null,

        // Properties to be sent into constructor

        constructor: function () {
            // summary:
            //      description
            console.log('app/search/Search:constructor', arguments);

            this.selectedQueryLayers = [];

            this.own(
                topic.subscribe(config.topics.appQueryLayer.addLayer,
                    lang.hitch(this, 'onAddQueryLayer')),
                topic.subscribe(config.topics.appQueryLayer.removeLayer,
                    lang.hitch(this, 'onRemoveQueryLayer'))
            );

            this.additionalSearches = [];
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
        onAddQueryLayer: function (qLayer) {
            // summary:
            //      description
            // qLayer: QueryLayer
            console.log('app/search/Search:onAddQueryLayer', arguments);

            this.selectedQueryLayers.push(qLayer);

            this.checkForAdditionalSearches();
            this.checkSiteIDSearches();
        },
        checkSiteIDSearches: function () {
            // summary:
            //      description
            console.log('app/search/Search:checkSiteIDSearches', arguments);
        
            if (this.selectedQueryLayers.length > 0) {
                var that = this;
                var checkSome = function (fieldName) {
                    return array.some(that.selectedQueryLayers, function (ql) {
                        return ql[fieldName] === 'n/a';
                    });
                };

                var name = checkSome(config.fieldNames.queryLayers.NAME);
                var id = checkSome(config.fieldNames.queryLayers.ID);

                var updateOption = function (hide, option) {
                    if (hide) {
                        domClass.add(option, 'hidden');

                        // reset select if the current pane is being hidden
                        if (that.select.value === option.value) {
                            that.select.value = 'empty';
                            that.onSelectChange();
                        }
                    } else {
                        domClass.remove(option, 'hidden');
                    }
                };

                updateOption(id, this.idOption);
                updateOption(name, this.nameOption);
            }
        },
        checkForAdditionalSearches: function () {
            // summary:
            //      description
            console.log('app/search/Search:checkForAdditionalSearches', arguments);

            this.removeAdditionalSearches();

            if (this.selectedQueryLayers.length === 1) {
                var qLayer = this.selectedQueryLayers[0];
                if (qLayer.additionalSearchObjects && qLayer.additionalSearchObjects.length) {
                    array.forEach(qLayer.additionalSearchObjects, lang.hitch(this, 'addAdditionalSearch'));
                }
            }
        },
        addAdditionalSearch: function (obj) {
            // summary:
            //      description
            // obj: Object
            console.log('app/search/Search:addAdditionalSearch', arguments);

            var as = new AdditionalSearch(obj);
            this[obj.fieldName] = as;
            this.stackContainer.addChild(as);
            this.additionalSearches.push(as);

            domConstruct.create('option', {
                value: obj.fieldName,
                innerHTML: obj.fieldAlias
            }, this.select);
        },
        removeAdditionalSearches: function () {
            // summary:
            //      description
            console.log('app/search/Search:removeAdditionalSearches', arguments);

            var that = this;

            array.forEach(this.additionalSearches, function (as) {
                if (that.currentPane === as) {
                    that.select.value = 'empty';
                    that.currentPane = that.empty;
                    that.onSelectChange();
                }
                that.stackContainer.removeChild(as);
                array.every(that.select.children, function (node) {
                    if (node.value === as.fieldName) {
                        domConstruct.destroy(node);
                        return false;
                    } else {
                        return true;
                    }
                });
                as.destroy();
            });
            this.additionalSearches = [];
        },
        onRemoveQueryLayer: function (qLayer) {
            // summary:
            //      description
            // qLayer: QueryLayer
            console.log('app/search/Search:onRemoveQueryLayer', arguments);

            this.selectedQueryLayers.splice(array.indexOf(this.selectedQueryLayers, qLayer), 1);

            this.checkForAdditionalSearches();
            this.checkSiteIDSearches();
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
                lang.mixin(params, that.getQueryLayersParam());
                if (config.user) {
                    params.token = config.user.token;
                    params.userId = config.user.userId;
                }
                request(config.urls.search, {
                    method: 'POST',
                    data: JSON.stringify(params),
                    headers: {'Content-Type': 'application/json'},
                    handleAs: 'json',
                    timeout: 40000
                }).then(
                    function (response) {
                        if (response.status !== 200 ||
                            (response.queryLayers && response.queryLayers.status !== 200) ||
                            (response.secureQueryLayers && response.secureQueryLayers.status !== 200)) {
                            onError(that.searchServiceErrorMsg);
                        } else {
                            var results = {};
                            if (response.secureQueryLayers) {
                                // add s's to secure layer indices
                                var result = response.secureQueryLayers.result;
                                for (var p in result) {
                                    if (result.hasOwnProperty(p)) {
                                        result['s' + p] = result[p];
                                        delete result[p];
                                    }
                                }
                                lang.mixin(results, response.secureQueryLayers.result);
                            }

                            if (response.queryLayers) {
                                lang.mixin(results, response.queryLayers.result);
                            }
                            topic.publish(config.topics.appSearch.featuresFound, results);
                            topic.publish(config.topics.app.showGrid);
                            that.hideLoader();
                        }
                    },
                    function () {
                        onError(that.searchServiceErrorMsg);
                    }
                );
                topic.publish(config.topics.appSearch.searchStarted);
            };
            var onError = function (errTxt) {
                that.showErrMsg(errTxt);
                that.hideLoader();
                topic.publish(config.topics.appSearch.searchError);
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

            var obj = {
                queryLayers: [],
                secureQueryLayers: []
            };

            array.forEach(this.selectedQueryLayers, function (ql) {
                var a = (ql.secure === 'No') ? obj.queryLayers : obj.secureQueryLayers;
                a.push(ql.toJson());
            });

            // convert empty arrays to nulls
            if (obj.queryLayers.length === 0) {
                obj.queryLayers = null;
            }
            if (obj.secureQueryLayers.length === 0) {
                obj.secureQueryLayers = null;
            }

            return obj;
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
