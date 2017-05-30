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
    'dojo/on',
    'dojo/has',
    'dojo/string',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'dgrid/OnDemandGrid',
    'dgrid/tree',
    'dgrid/extensions/ColumnResizer',
    'dgrid/Selection',
    'dgrid/util/mouse',
    'dgrid/util/touch',

    'put-selector/put',

    'esri/geometry/Extent',

    'agrc/modules/Formatting',

    'app/config',
    'app/search/ResultLayer',
    'app/search/GridRowHeader'

], function (
    template,

    declare,
    array,
    lang,

    Memory,
    topic,
    query,
    domConstruct,
    domClass,
    on,
    has,
    dojoString,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    Grid,
    tree,
    ColumnResizer,
    Selection,
    mouseUtil,
    touchUtil,

    put,

    Extent,

    formatting,

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

        // allDownloadIDs: Object
        allDownloadIDs: null,

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app/search/ResultsGrid::postCreate', arguments);

            this.setupConnections();
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            //
            console.log('app/search/ResultsGrid::setupConnections', arguments);

            this.own(
                topic.subscribe(config.topics.appSearch.searchStarted,
                    lang.hitch(this, 'clear')),
                topic.subscribe(config.topics.appSearch.clear,
                    lang.hitch(this, 'clear')),
                topic.subscribe(config.topics.appSearch.featuresFound,
                    lang.hitch(this, 'onFeaturesFound')),
                topic.subscribe(config.topics.appResultLayer.identifyFeature,
                    lang.hitch(this, 'identifyMapFeature'))
            );
        },
        initGrid: function () {
            // summary:
            //      creates the dgrid
            console.log('app/search/ResultsGrid:initGrid', arguments);

            var that = this;
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
                        // console.log('renderCell');
                        // format header rows only
                        if (item.count === undefined) {
                            // not using a widget because I'm guessing it would hurt performance
                            // for larger datasets
                            var div = put('div.btn-cont');
                            if (value !== config.messages.noFeaturesFound) {
                                var btn = put(
                                    div,
                                    'button.btn.btn-default.btn-xs' + ((has('touch')) ? '.touch' : ''),
                                    '...'
                                );
                                // .touch above shows the button for every row for touch devices that don't
                                // support the enterRow and leaveRow events below
                                on(btn, 'click', function () {
                                    topic.publish(config.topics.appSearch.identify, item);
                                });
                            }
                            put(div, 'span', value);

                            return div;
                        }

                        return new GridRowHeader(item).domNode;
                    }
                }), {
                    field: fn.NAME,
                    label: cap(fn.NAME)
                }, {
                    field: fn.TYPE,
                    label: cap(fn.TYPE)
                }, {
                    field: fn.ADDRESS,
                    label: cap(fn.ADDRESS)
                }, {
                    field: fn.CITY,
                    label: cap(fn.CITY)
                }
            ];

            this.grid = new (declare([Grid, ColumnResizer, Selection]))({
                columns: columns,
                store: new Memory({
                    idProperty: fn.UNIQUE_ID,
                    getChildren: function (item, options) {
                        console.log('Grid:getChildren');

                        return this.query({ parent: item[fn.UNIQUE_ID] }, options);
                    },
                    mayHaveChildren: function (item) {
                        console.log('Grid:mayHaveChildren', item.parent);

                        return !item.parent;
                    },
                    query: function (queryObject, options) {
                        queryObject = queryObject || {};
                        options = options || {};

                        // this block is to make the sorting of strings case-insensitive
                        // it overrides the default sort logic adding in the .toLowerCase stuff
                        if (options.sort) {
                            var sort = options.sort[0];
                            var sortFunc = lang.partial(that.sortValues, sort);
                            options.sort = sortFunc;
                        }

                        if (!queryObject.parent && !options.deep) {
                            // Default to a single-level query for root items (no parent)
                            queryObject.parent = undefined;
                        }

                        return this.queryEngine(queryObject, options)(this.data);
                    }
                }),
                allowSelectAll: true,
                selectionMode: 'custom',
                allowSelect: this.allowSelect,
                _customSelectionHandler: this.selectionHandler,
                renderRow: this.renderRow
            }, this.gridDiv);
            this.grid.set('sort', fn.ID);
            this.grid.startup();

            this.own(
                this.grid.on('dgrid-select, dgrid-deselect',
                    lang.hitch(this, 'sendDownloadData')),
                topic.subscribe(config.topics.appDownloadDownload.clearSelection,
                    lang.hitch(this.grid, 'clearSelection')),
                this.grid.on('dgrid-sort', lang.hitch(this, 'onGridSort'))
            );

            if (has('touch')) {
                var activeRow;
                this.own(
                    this.grid.on(touchUtil.selector('.dgrid-row:click', touchUtil.tap), function (evt) {
                        if (activeRow) {
                            that.onRowLeave(activeRow);
                        }
                        that.onRowEnter(evt);
                        that.onRowClick(evt);
                        activeRow = evt;
                    })
                );
            } else {
                this.own(
                    this.grid.on('.dgrid-row:click', lang.hitch(this, 'onRowClick')),
                    this.grid.on(mouseUtil.enterRow, lang.hitch(this, 'onRowEnter')),
                    this.grid.on(mouseUtil.leaveRow, lang.hitch(this, 'onRowLeave'))
                );
            }
        },
        /*eslint-disable*/
        sortValues: function (sortOptions, a, b) {
            var options = {
                desc: sortOptions.descending,
                insensitive: true
            };
            a = a[sortOptions.attribute];
            b = b[sortOptions.attribute];

            // got from https://github.com/javve/natural-sort/blob/master/index.js (MIT license)
            // after trying in vain to load via bower
            var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
                sre = /(^[ ]*|[ ]*$)/g,
                dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
                hre = /^0x[0-9a-f]+$/i,
                ore = /^0/,
                options = options || {},
                i = function (s) { return options.insensitive && ('' + s).toLowerCase() || '' + s },
                // convert all to strings strip whitespace
                x = i(a).replace(sre, '') || '',
                y = i(b).replace(sre, '') || '',
                // chunk/tokenize
                xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
                yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
                // numeric, hex or date detection
                xD = parseInt(x.match(hre)) || (xN.length !== 1 && x.match(dre) && Date.parse(x)),
                yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
                oFxNcL, oFyNcL,
                mult = options.desc ? -1 : 1;
            // first try and sort Hex codes or Dates
            if (yD)
                if ( xD < yD ) return -1 * mult;
                else if ( xD > yD ) return 1 * mult;
            // natural sorting through split numeric strings and default strings
            for (var cLoc = 0, numS = Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
                // find floats not starting with '0', string or 0 if not defined (Clint Priest)
                oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
                oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
                // handle numeric vs string comparison - number < string - (Kyle Adams)
                if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
                // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
                else if (typeof oFxNcL !== typeof oFyNcL) {
                    oFxNcL += '';
                    oFyNcL += '';
                }
                if (oFxNcL < oFyNcL) return -1 * mult;
                if (oFxNcL > oFyNcL) return 1 * mult;
            }
            return 0;
        },
        /*eslint-enable*/
        onGridSort: function () {
            // summary:
            //      Used to temporarily collapse trees for sorting which increases performance
            //      exponentially.
            console.log('app/search/ResultsGrid:onGridSort', arguments);

            var expanded = [];
            var that = this;
            // collapse any open trees
            query('.ui-icon-triangle-1-se', this.grid.domNode).forEach(function (el) {
                var row = that.grid.row(el);
                expanded.push(row.data[config.fieldNames.queryLayers.UNIQUE_ID]);
                that.grid.expand(row, false, true);
            });

            // reopen nodes after search has completed
            var handle = this.grid.on('dgrid-refresh-complete', function () {
                handle.remove();
                array.forEach(expanded, function (id) {
                    that.grid.expand(that.grid.row(id), true, true);
                });
            });
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

            this.sendDownloadData();
        },
        clear: function () {
            // summary:
            //      clears the data out of the grid
            console.log('app/search/ResultsGrid:clear', arguments);

            if (this.grid) {
                this.grid.store.data = null;
                this.grid.refresh();
            }
            this.allDownloadIDs = null;
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
            console.log('app/search/ResultsGrid:getStoreData', arguments);

            var storeData = [];
            var fn = config.fieldNames.queryLayers;
            var oids = [];
            // declare this outside of for loop so that getAttributes can use it
            var layerIndex;
            var getAttributes = function (graphic) {
                oids.push(graphic[fn.OBJECTID]);
                graphic.parent = layerIndex;
                graphic[fn.UNIQUE_ID] = layerIndex + '-' + graphic[fn.OBJECTID];
                graphic.geometry = graphic.geometry;

                return graphic;
            };
            var layerName;

            var colorIndex = 0;
            // for (layerIndex in data) {
            this.getSortedQueryLayerIds(data, config.appJson.queryLayers).forEach(function (i) {
                layerIndex = i;
                if (data.hasOwnProperty(layerIndex)) {
                    var ql = config.getQueryLayerByIndex(layerIndex);
                    layerName = ql.name;
                    var header = {};
                    var count = data[layerIndex].features.length;
                    var color;
                    if (ql[fn.ENVIROAPPSYMBOL] === 'n/a') {
                        color = config.symbols.colors[colorIndex];
                    } else {
                        // set to white and set color index back so that we can reuse it
                        color = [255, 255, 255]; // eslint-disable-line no-magic-numbers
                        colorIndex -= 1;
                    }

                    // these properties are using in renderCell above
                    header.name = layerName;
                    header.count = formatting.addCommas(count);
                    header.color = color;
                    header[fn.UNIQUE_ID] = layerIndex;
                    header.geometryType = ql.geometryType;
                    storeData.push(header);

                    if (count > 0) {
                        oids = []; // reset and then populated in getAttributes
                        storeData = storeData.concat(array.map(data[layerIndex].features, getAttributes));

                        // show data on map
                        new ResultLayer(color, oids, ql.geometryType, layerIndex); // eslint-disable-line no-new
                    } else {
                        // show a no data row
                        var noResultsFound = {};
                        noResultsFound[fn.ID] = config.messages.noFeaturesFound;
                        noResultsFound[fn.UNIQUE_ID] = layerIndex + '-' + config.messages.noFeaturesFound;
                        noResultsFound.parent = layerIndex;
                        storeData.push(noResultsFound);
                    }

                    // loop through colors and start over after 12
                    const lastIndex = 11;
                    colorIndex = (colorIndex < lastIndex) ? colorIndex + 1 : 0;
                }
            });

            return storeData;
        },
        onRowEnter: function (evt) {
            // summary:
            //      publishes highlight topic for that feature
            // evt: Mouse Event Object
            // console.log('app/search/ResultsGrid:onRowEnter', arguments);

            var item = this.grid.row(evt).data;
            topic.publish(config.topics.appResultLayer.highlightFeature, item.OBJECTID, item.parent);
        },
        onRowLeave: function (evt) {
            // summary:
            //      description
            // param: type or return: type
            // console.log('app/search/ResultsGrid:onRowLeave', arguments);

            if (evt.target.type !== 'submit') {
                topic.publish(config.topics.appResultLayer.clearSelection);
            }
        },
        allowSelect: function (row) {
            // summary:
            //      Don't allow header rows or no results rows to be selected
            // row: Row
            console.log('app/search/ResultsGrid:allowSelect', arguments);

            return row.data.parent && row.data.ID !== config.messages.noFeaturesFound;
        },
        selectionHandler: function (evt, row) {
            // summary:
            //      Need to define a custom selection handler to allow us to properly
            //      prevent selection when the identify button is clicked
            // evt: Event Object
            // row: Row
            console.log('app/search/ResultsGrid:selectionHandler', arguments);

            // prevent selection if identify button was clicked
            if (domClass.contains(evt.target, 'btn')) {
                return;
            }

            var handler = (has('touch')) ? this._toggleSelectionHandler : this._extendedSelectionHandler;
            lang.hitch(this, handler)(evt, row);
        },
        sendDownloadData: function () {
            // summary:
            //      Gets selected feature ids or all feature ids if there is no selection
            console.log('app/search/ResultsGrid:sendDownloadData', arguments);

            var downloadIDs = {};
            var idHash = this.grid.selection;
            var isEmpty = function (obj) {
                for (var key in obj) {
                    if (hasOwnProperty.call(obj, key)) {
                        return false;
                    }
                }

                return true;
            };
            var addItem = function (parent, id) {
                var fcname = config.getQueryLayerByIndex(parent).sgidName.split('.')[2];
                if (!downloadIDs[fcname]) {
                    downloadIDs[fcname] = [];
                }
                downloadIDs[fcname].push(id);
            };
            var isSelection;

            if (isEmpty(idHash)) {
                isSelection = false;
                if (this.allDownloadIDs) {
                    downloadIDs = this.allDownloadIDs;
                } else {
                    array.forEach(this.grid.store.data, function (item) {
                        if (item.parent && item.ID !== config.messages.noFeaturesFound) {
                            addItem(item.parent, item.ID);
                        }
                    });
                    // cache so that we don't have to loop through all rows in the grid every time
                    this.allDownloadIDs = downloadIDs;
                }
            } else {
                isSelection = true;
                for (var id in idHash) {
                    if (idHash.hasOwnProperty(id)) {
                        var parent = id.split('-')[0];
                        var ID = id.split('-')[1];
                        addItem(parent, ID);
                    }
                }
            }

            topic.publish(config.topics.appSearchResultsGrid.downloadFeaturesDefined, downloadIDs, isSelection);
        },
        identifyMapFeature: function (oid, layerIndex) {
            // summary:
            //      queries for feature attributes and identifies the feature
            // oid: Number
            // layerIndex: String
            console.log('app/search/ResultsGrid:identifyMapFeature', arguments);

            var uid = layerIndex + '-' + oid;
            var item = this.grid.store.get(uid);
            topic.publish(config.topics.appSearch.identify, item);
        },
        getSortedQueryLayerIds: function (data, queryLayers) {
            // summary:
            //      returns a list of query layer ids that are sorted to match
            //      the order that they appear in the search list
            // data: Object the data returned from the search service
            // queryLayers: The array of query layers as defined in DEQEnviro.json
            console.log('app/search/ResultsGrid:getSortedQueryLayerIds', arguments);

            var ids = queryLayers.map(function (ql) {
                return ql.index;
            });

            return ids.filter(function (i) {
                return data[i];
            });
        }
    });
});
