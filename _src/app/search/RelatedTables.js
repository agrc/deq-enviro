define([
    'dojo/text!./templates/RelatedTables.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/request',
    'dojo/dom-construct',
    'dojo/dom-class',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'app/config',
    './RelatedTableGrid'
], function (
    template,

    declare,
    array,
    lang,
    request,
    domConstruct,
    domClass,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    config,
    RelatedTableGrid
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      Queries and displays related table records

        templateString: template,
        baseClass: 'related-tables',
        widgetsInTemplate: true,

        // grids: RelatedTableGrid[]
        //      container for all current grids
        grids: null,

        // gridFactories: function[]
        //      a collection of all of the functions that build the grid
        //      this is used to delay the build until the tab is shown so
        //      that they layout correctly
        gridFactories: null,


        // Properties to be sent into constructor

        // tab: node
        //      used to listen for when this tab is shown
        tab: null,

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.search.RelatedTables::postCreate', arguments);

            this.inherited(arguments);

            $(this.tab).on('shown.bs.tab', lang.hitch(this, 'buildGrids'));

            this.grids = [];
            this.gridFactories = [];
        },
        buildGrids: function () {
            // summary:
            //      fires grid factories that have been queued up by getRelatedFeatures
            console.log('app/search/RelatedTables:buildGrids', arguments);

            array.forEach(this.gridFactories, function (f) {
                f();
            });
            this.gridFactories = [];
        },
        getRelatedFeatures: function (item) {
            // summary:
            //      first gets relationship ids for the layer, then
            //      queries each of them for related records, finally
            //      creates new grids or stores them in a queue to be created later
            // item: Object
            console.log('app/search/RelatedTables:getRelatedFeatures', arguments);

            var that = this;
            this.gridFactories = [];
            this.destroyGrids();
            var fiveFields = {};
            var fn = config.fieldNames.queryLayers;
            fiveFields[fn.ID] = item[fn.ID];
            fiveFields[fn.NAME] = item[fn.NAME];
            fiveFields[fn.ADDRESS] = item[fn.ADDRESS];
            fiveFields[fn.CITY] = item[fn.CITY];
            fiveFields[fn.TYPE] = item[fn.TYPE];

            var buildGrid = function (relatedResponse, tableId) {
                var gridFactory = function () {
                    domClass.add(that.noRelatedTablesMsg, 'hidden');
                    domClass.remove(that.pillsDiv, 'hidden');

                    // should only ever be one relatedRecordGroup since we are
                    // only passing in one objectid
                    var grid = new RelatedTableGrid({
                        tableId: tableId,
                        records: (relatedResponse.relatedRecordGroups.length > 0) ?
                            relatedResponse.relatedRecordGroups[0].relatedRecords :
                            false,
                        pillsDiv: that.pillsDiv,
                        fields: relatedResponse.fields,
                        fiveFields: fiveFields
                    }, domConstruct.create('div', null, that.panesDiv));
                    grid.startup();
                    that.grids.push(grid);
                };

                // if related records tab is showing then build grids, otherwise
                // put them in a queue for later
                if (domClass.contains(that.tab.parentElement, 'active')) {
                    gridFactory();
                } else {
                    that.gridFactories.push(gridFactory);
                }
            };
            var url = config.urls.DEQEnviro + '/' + item.parent;
            var queryRelationships = function (layerProps) {
                array.forEach(layerProps.relationships, function (rel) {
                    request(url + '/queryRelatedRecords', {
                        handleAs: 'json',
                        query: {
                            f: 'json',
                            objectIds: [item.OBJECTID],
                            relationshipId: rel.id,
                            outFields: '*',
                            returnGeometry: false
                        },
                        headers: {
                            'X-Requested-With': null
                        }
                    }).then(function (response) {
                        buildGrid(response, rel.relatedTableId);
                    });
                });
            };

            domClass.remove(this.noRelatedTablesMsg, 'hidden');
            domClass.add(this.pillsDiv, 'hidden');
            that.destroyGrids();

            request(url, {
                handleAs: 'json',
                query: { f: 'json' },
                headers: {
                    'X-Requested-With': null
                }
            }).then(queryRelationships);
        },
        destroyGrids: function () {
            // summary:
            //      destroys the grid widgets and their associated tabs
            console.log('app/search/RelatedTables:destroyGrids', arguments);

            array.forEach(this.grids, function (g) {
                g.destroy();
            });
            this.grids = [];
        }
    });
});
