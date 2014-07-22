define([
    'dojo/text!./templates/IdentifyPane.html',

    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojo/topic',

    'app/config',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'esri/tasks/query',
    'esri/tasks/QueryTask'

], function(
    template,

    declare,
    lang,

    topic,

    config,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    Query,
    QueryTask
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      Shows details about the selected search result item.

        templateString: template,
        baseClass: 'identify-pane',
        widgetsInTemplate: true,

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //    Overrides method of same name in dijit._Widget.
            // tags:
            //    private
            console.log('app/search/IdentifyPane::postCreate', arguments);

            this.setupConnections();
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