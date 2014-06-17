define([
    'dojo/text!./templates/ResultsGrid.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',

    'dojo/store/Memory',
    'dojo/topic',
    'dojo/query',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'dgrid/OnDemandGrid',
    'dgrid/tree',
    'dgrid/extensions/ColumnResizer',

    'put-selector/put',

    'app/config'

], function(
    template,

    declare,
    array,
    lang,

    Memory,
    topic,
    query,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    Grid,
    tree,
    ColumnResizer,

    put,

    config
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      Sorts and displays the search results.

        templateString: template,
        baseClass: 'results-grid',
        widgetsInTemplate: true,

        // grid: Grid
        //      the main grid
        grid: null,


        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app/search/ResultsGrid::postCreate', arguments);

            this.setupConnections();
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app/search/ResultsGrid::setupConnections', arguments);

            this.own(
                topic.subscribe(config.topics.appSearch.searchStarted,
                    lang.hitch(this, 'clear')),
                topic.subscribe(config.topics.appSearch.featuresFound,
                    lang.hitch(this, 'onFeaturesFound'))
            );
        },
        initGrid: function () {
            // summary:
            //      creates the dgrid
            console.log('app/search/ResultsGrid:initGrid', arguments);
        
            var fn = config.fieldNames.queryLayers;
            var cap = function (str) {
                str = str.toLowerCase();
                return str[0].toUpperCase() + str.slice(1);
            };
            var columns = [
                {
                    field: fn.UNIQUE_ID
                },
                tree({
                    field: fn.ID,
                    label: cap(fn.ID),
                    formatter: function (value) {
                        var s = value.split('|');

                        // format feature counts if present
                        if (s.length > 1) {
                            return s[0] + ' | <strong>' + s[1] + '</strong>';
                        } else {
                            return value;
                        }
                    }
                }),{
                    field: fn.NAME,
                    label: cap(fn.NAME)
                },{
                    field: fn.TYPE,
                    label: cap(fn.TYPE)
                },{
                    field: fn.ADDRESS,
                    label: cap(fn.ADDRESS)
                },{
                    field: fn.CITY,
                    label: cap(fn.CITY)
                }
            ];

            this.grid = new (declare([Grid, ColumnResizer]))({
                columns: columns,
                store: new Memory({
                    idProperty: fn.UNIQUE_ID,
                    getChildren: function (item, options) {
                        return this.query({parent: item[fn.UNIQUE_ID]}, options);
                    },
                    mayHaveChildren: function (item) {
                        return !item.parent;
                    },
                    query: function (query, options){
                        query = query || {};
                        options = options || {};

                        
                        if (!query.parent && !options.deep) {
                            // Default to a single-level query for root items (no parent)
                            query.parent = undefined;
                        }
                        return this.queryEngine(query, options)(this.data);
                    }
                }),
                renderRow: this.renderRow
            }, this.gridDiv);

            // expand parent if any part of the row is clicked
            var that = this;
            this.grid.on('.dgrid-row:click', function (evt) {
                console.log(evt);
                var row = that.grid.row(evt);
                if (!row.parent) {
                    that.grid.expand(row);
                }
            });
        },
        renderRow: function (item) {
            // summary:
            //      override to merge cells into one for header rows
            // item: Object
            //      The store item to be rendered
            // console.log('app/search/ResultsGrid:renderRow', arguments);
        
            var div = this.inherited(arguments);

            // remove all empty cells
            if (!item.parent) {
                query('td:not(.field-ID)', div).forEach(function (node) {
                    put(node, '!');
                });
            }

            return div;
        },
        onFeaturesFound: function (data) {
            // summary:
            //      called after a successful search has returned
            // data: Object
            //      data object as returned from the search service
            console.log('app/search/ResultsGrid:onFeaturesFound', arguments);

            if (!this.grid) {
                this.initGrid();
            }

            this.grid.store.setData(this.getStoreData(data));
            this.grid.refresh();
        },
        clear: function () {
            // summary:
            //      clears the data out of the grid
            console.log('app/search/ResultsGrid:clear', arguments);
            
            if (this.grid) {
                this.grid.store.data = null;
                this.grid.refresh();
            }
        },
        getStoreData: function (data) {
            // summary:
            //      formats the feature set so that it fits into the store
            //      Adds a unique id to each data store item so that the grid can
            //      use them appropriately.
            //      Unique id format are as follows:
            //          header: layer index ('5')
            //          no feature found item: layer index + message ('5-No features found for this layer')
            //          feature: layer index + ID ('5-12345566')
            // data: Object
            //      data object as returned from the search service
            console.log('module.id:getStoreData', arguments);

            var storeData = [];
            var fn = config.fieldNames.queryLayers;
            var getAttributes = function (graphic) {
                graphic.attributes.parent = layerIndex;
                graphic.attributes[fn.UNIQUE_ID] = layerIndex + '-' + graphic.attributes[fn.ID];
                return graphic.attributes;
            };
            var layerName;

            // declare this outside of for loop so that getAttributes can use it
            var layerIndex;

            for (layerIndex in data) {
                if (data.hasOwnProperty(layerIndex)) {
                    layerName = config.queryLayerNames[layerIndex];
                    var header = {};
                    var count = data[layerIndex].length;
                    header[fn.ID] = layerName + '|' + count;
                    header[fn.UNIQUE_ID] = layerIndex;
                    storeData.push(header);

                    if (count > 0) {
                        storeData = storeData.concat(array.map(data[layerIndex], getAttributes));
                    } else {
                        var noResultsFound = {};
                        noResultsFound[fn.ID] = config.messages.noFeaturesFound;
                        noResultsFound[fn.UNIQUE_ID] = layerIndex + '-' + config.messages.noFeaturesFound;
                        noResultsFound.parent = layerIndex;
                        storeData.push(noResultsFound);
                    }
                }
            }

            console.log(storeData);
            return storeData;
        }
    });
});
