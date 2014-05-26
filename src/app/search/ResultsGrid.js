define([
    'dojo/text!./templates/ResultsGrid.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',

    'dojo/store/Memory',
    'dojo/topic',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'dgrid/OnDemandGrid',
    'dgrid/tree',
    'dgrid/extensions/ColumnResizer',

    'app/config',

    'underscore.string'

], function(
    template,

    declare,
    array,
    lang,

    Memory,
    topic,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    Grid,
    tree,
    ColumnResizer,

    config,

    uString
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
                topic.subscribe(config.topics.appSearch.featuresFound,
                    lang.hitch(this, 'onFeaturesFound'))
            );
        },
        onFeaturesFound: function (data) {
            // summary:
            //      called after a successful search has returned
            // data: Object
            //      data object as returned from the search service
            console.log('app/search/ResultsGrid:onFeaturesFound', arguments);

            var fn = config.fieldNames.queryLayers;
            var columns = [
                {
                    field: 'OBJECTID',
                    size: 0
                },
                tree({
                    field: fn.ID,
                    label: uString.capitalize(fn.ID.toLowerCase())
                }),{
                    field: fn.NAME,
                    label: uString.capitalize(fn.NAME.toLowerCase())
                },{
                    field: fn.TYPE,
                    label: uString.capitalize(fn.TYPE.toLowerCase())
                },{
                    field: fn.ADDRESS,
                    label: uString.capitalize(fn.ADDRESS.toLowerCase())
                },{
                    field: fn.CITY,
                    label: uString.capitalize(fn.CITY.toLowerCase())
                }
            ];

            this.grid = new (declare([Grid, ColumnResizer]))({
                columns: columns,
                store: new Memory({
                    data: this.getStoreData(data),
                    idProperty: fn.ID,
                    getChildren: function (item, options) {
                        return this.query({parent: item[fn.ID]}, options);
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
                })
            }, this.gridDiv);
        },
        getStoreData: function (data) {
            // summary:
            //      formats the feature set so that it fits into the store
            // data: Object
            //      data object as returned from the search service
            console.log('module.id:getStoreData', arguments);

            var storeData = [];
            var getAttributes = function (graphic) {
                graphic.attributes.parent = layerName;
                return graphic.attributes;
            };
            var layerName;

            for (var layerIndex in data) {
                if (data.hasOwnProperty(layerIndex)) {
                    layerName = config.queryLayerNames[layerIndex];
                    var header = {};
                    header[config.fieldNames.queryLayers.ID] = layerName;
                    storeData.push(header);

                    if (data[layerIndex].length > 0) {
                        storeData = storeData.concat(array.map(data[layerIndex], getAttributes));
                    } else {
                        var noResultsFound = {};
                        noResultsFound[config.fieldNames.queryLayers.ID] = 'No results found for this layer';
                        noResultsFound.parent = layerName;
                        storeData.push(noResultsFound);
                    }
                }
            }

            console.log(storeData);
            return storeData;
        }
    });
});