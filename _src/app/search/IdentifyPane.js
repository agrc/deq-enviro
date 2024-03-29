define([
    'jquery',
    'dojo/text!./templates/IdentifyPane.html',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',

    'dojo/topic',
    'dojo/store/Memory',
    'dojo/dom-class',
    'dojo/io-query',

    'app/config',
    'app/formatDates',
    'app/search/RelatedTables',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'esri/tasks/query',
    'esri/tasks/QueryTask',

    'dgrid/OnDemandGrid'

], function (
    $,
    template,

    declare,
    lang,
    array,

    topic,
    Memory,
    domClass,
    ioQuery,

    config,
    formatDates,
    RelatedTables,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    Query,
    QueryTask,

    Grid
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      Shows details about the selected search result item.

        templateString: template,
        baseClass: 'identify-pane',
        widgetsInTemplate: true,

        // query: Query
        //      The query parameters to pass to the query task
        query: null,

        // attributeGrid: OnDemandGrid
        attributeGrid: null,

        // currentFeatureGeometry: Geometry
        //      The geometry for the currently identified feature.
        //      Used for zoom to function
        currentFeatureGeometry: null,

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app/search/IdentifyPane::postCreate', arguments);

            this.setupConnections();

            // set up one-time query parameters
            this.query = new Query();
            this.query.outFields = ['*'];
            this.query.returnGeometry = true;

            // set up empty grid
            var urlRegex = /^https?:\/\/.*/;
            var columns = [
                {
                    field: 'fieldAlias'
                }, {
                    field: 'value',
                    formatter: item => {
                        if (urlRegex.test(item)) {
                            return `<a href="${item}" target="_blank">link</a>`;
                        }

                        return item;
                    }
                }
            ];
            this.attributeGrid = new Grid({
                columns: columns,
                showHeader: false,
                store: new Memory({ idProperty: 'fieldAlias' })
            }, this.attributeGridDiv);

            this.relatedTables = new RelatedTables({
                tab: this.relatedAnchor
            }, this.relatedTablesDiv);
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            //
            console.log('app/search/IdentifyPane::setupConnections', arguments);

            this.own(
                topic.subscribe(config.topics.appSearch.identify, lang.hitch(this, 'identify'))
            );
        },
        updateLinks: function (item) {
            // summary:
            //      updates the four link types for this feature
            // item: Object
            console.log('app/search/IdentifyPane:updateLinks', arguments);

            var fn = config.fieldNames.queryLayers;
            var obj = {};
            obj[fn.ID] = item[fn.ID];
            obj[fn.NAME] = item[fn.NAME];
            obj[fn.ADDRESS] = item[fn.ADDRESS];
            obj[fn.CITY] = item[fn.CITY];
            obj[fn.TYPE] = item[fn.TYPE];

            var query = ioQuery.objectToQuery(obj);

            var ql = config.getQueryLayerByIndex(item.parent);

            var updateLink = function (node, url) {
                if (url === '') {
                    domClass.add(node, 'hidden');
                } else {
                    domClass.remove(node, 'hidden');
                    // support url's with or without existing query parameters
                    node.href = url + ((url.indexOf('?') === -1) ? '?' : '&') + query;
                }
            };
            updateLink(this.docLink, ql.docLink);
            updateLink(this.gramaLink, ql.gramaLink);
            updateLink(this.permitLink, ql.permitLink);
            updateLink(this.additionalLink, ql.additionalLink);
        },
        identify: function (item) {
            // summary:
            //      queries for feature and related data
            // item: Object from grid
            //      expects these properties: OBJECTID, parent, geometry, & five main fields
            console.log('app/search/IdentifyPane:identify', arguments);

            // clear previous values
            this.attributeGrid.store.data = null;
            this.attributeGrid.refresh();
            domClass.add(this.errorMsg, 'hidden');

            this.query.objectIds = [item.OBJECTID];

            var url;
            if (item.parent.indexOf('s') === -1) {
                url = config.urls.DEQEnviro + '/' + item.parent;
            } else {
                url = config.urls.secure + '/' + item.parent.slice(1);
            }

            var task = new QueryTask(url);
            var that = this;
            var onError = function () {
                domClass.remove(that.errorMsg, 'hidden');
            };
            task.execute(this.query).then(
                function (fSet) {
                    if (fSet.features.length === 0) {
                        onError();
                    } else {
                        var feat = fSet.features[0];
                        that.currentFeatureGeometry = feat.geometry;
                        formatDates.formatAttributes(feat, fSet.fields);
                        that.attributeGrid.store.setData(
                            that.getStoreData(fSet.features[0].attributes,
                                config.getQueryLayerByIndex(item.parent).fields)
                        );
                        that.attributeGrid.refresh();
                        that.relatedTables.getRelatedFeatures(item);
                    }
                },
                function () {
                    onError();
                }
            );

            this.updateLinks(item);
        },
        getStoreData: function (attributes, fields) {
            // summary:
            //      description
            // attributes: Object
            //      hash of properties from feature
            // fields: [<fieldname>, <field alias>][]
            console.log('app/search/IdentifyPane:getStoreData', arguments);

            return array.map(fields, function (f) {
                return {
                    fieldAlias: f[1],
                    value: attributes[f[0]]
                };
            });
        },
        backToResults: function (evt) {
            // summary:
            //      fires when user clicks on the back to results button
            // evt: Event Object
            console.log('app/search/IdentifyPane:backToResults', arguments);

            evt.preventDefault();

            this.attributesAnchor.click();

            topic.publish(config.topics.appSearchIdentifyPane.backToResults);
            topic.publish(config.topics.appResultLayer.clearSelection);
        },
        zoomToFeature: function (evt) {
            // summary:
            //      zooms to the identified feature
            // evt: Event Object
            console.log('app/search/IdentifyPane:zoomToFeature', arguments);

            evt.preventDefault();

            topic.publish(config.topics.appMapMapController.zoom, this.currentFeatureGeometry);
        }
    });
});
