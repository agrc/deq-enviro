define([
    'dojo/text!./templates/IdentifyPane.html',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',

    'dojo/topic',
    'dojo/store/Memory',
    'dojo/dom-class',

    'app/config',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'esri/tasks/query',
    'esri/tasks/QueryTask',

    'dgrid/OnDemandGrid'

], function(
    template,

    declare,
    lang,
    array,

    topic,
    Memory,
    domClass,

    config,

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

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app/search/IdentifyPane::postCreate', arguments);

            this.setupConnections();

            // set up one-time query parameters
            this.query = new Query();
            this.query.outFields = ['*'];

            // set up empty grid
            var columns = {
                fieldAlias: 'Field Alias',
                value: 'Value'
            };
            this.attributeGrid = new Grid({
                columns: columns,
                showHeader: false,
                store: new Memory({idProperty: 'fieldAlias'})
            }, this.attributeGridDiv);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app/search/IdentifyPane::setupConnections', arguments);

            this.own(
                topic.subscribe(config.topics.appSearch.identify, lang.hitch(this, 'identify'))
            );
        },
        identify: function (item) {
            // summary:
            //      queries for feature and related data
            // item: Object from grid
            console.log('app/search/IdentifyPane:identify', arguments);
            
            // clear previous values
            this.attributeGrid.store.data = null;
            this.attributeGrid.refresh();
            domClass.add(this.errorMsg, 'hidden');

            this.query.objectIds = [item.OBJECTID];

            var task = new QueryTask(config.urls.DEQEnviro + '/' + item.parent);
            var that = this;
            var onError = function () {
                domClass.remove(that.errorMsg, 'hidden');
            };
            task.execute(this.query).then(
                function (fSet) {
                    if (fSet.features.length === 0) {
                        onError();
                    } else {
                        that.attributeGrid.store.setData(
                            that.getStoreData(fSet.features[0].attributes,
                                config.getQueryLayerByIndex(item.parent).fields)
                        );
                        that.attributeGrid.refresh();
                    }
                },
                function () {
                    onError();
                }
            );
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

            topic.publish(config.topics.appSearchIdentifyPane.backToResults);
        },
        zoomToFeature: function (evt) {
            // summary:
            //      zooms to the identified feature
            // evt: Event Object
            console.log('app/search/IdentifyPane:zoomToFeature', arguments);
        
            evt.preventDefault();
        }
    });
});