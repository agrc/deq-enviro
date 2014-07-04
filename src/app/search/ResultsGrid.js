define([
    'dojo/text!./templates/ResultsGrid.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',

    'dojo/store/Memory',
    'dojo/topic',
    'dojo/query',
    'dojo/dom-construct',
    'dojo/dom-class',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'dgrid/OnDemandGrid',
    'dgrid/tree',
    'dgrid/extensions/ColumnResizer',

    'put-selector/put',

    'app/config',
    './ResultLayer',
    './GridRowHeader'

], function(
    template,

    declare,
    array,
    lang,

    Memory,
    topic,
    query,
    domConstruct,
    domClass,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    Grid,
    tree,
    ColumnResizer,

    put,

    config,
    ResultLayer,
    GridRowHeader
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
                    renderCell: function (item, value) {
                        // format header rows only
                        if (item.count !== undefined) {
                            return new GridRowHeader(item).domNode;
                        } else {
                            return document.createTextNode(value);
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

            this.grid.on('.dgrid-row:click', lang.hitch(this, 'onRowClick'));
        },
        onRowClick: function (evt) {
            // summary:
            //      row click callback
            //      expand header rows
            // evt: Event Object
            console.log('app/search/ResultsGrid:onRowClick', arguments);

            if (domClass.contains(evt.target, 'dgrid-expando-icon')) {
                return;
            }
        
            var row = this.grid.row(evt);
            if (!row.parent) {
                this.grid.expand(row);
            }
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

            var colorIndex = 0;
            for (layerIndex in data) {
                if (data.hasOwnProperty(layerIndex)) {
                    var ql = config.getQueryLayerByIndex(layerIndex);
                    layerName = ql.name;
                    var header = {};
                    var count = data[layerIndex].length;
                    var color = config.symbols.colors[colorIndex];

                    // these properties are using in renderCell above
                    header.name = layerName;
                    header.count = count;
                    header.color = color;
                    header[fn.UNIQUE_ID] = layerIndex;
                    header.geometryType = ql.geometryType;
                    storeData.push(header);

                    if (count > 0) {
                        // show data on map
                        new ResultLayer(color, data[layerIndex], ql.geometryType);

                        storeData = storeData.concat(array.map(data[layerIndex], getAttributes));
                    } else {
                        // show a no data row
                        var noResultsFound = {};
                        noResultsFound[fn.ID] = config.messages.noFeaturesFound;
                        noResultsFound[fn.UNIQUE_ID] = layerIndex + '-' + config.messages.noFeaturesFound;
                        noResultsFound.parent = layerIndex;
                        storeData.push(noResultsFound);
                    }

                    // loop through colors and start over after 12
                    colorIndex = (colorIndex < 11) ? colorIndex + 1 : 0;
                }
            }

            return storeData;
        }
    });
});
