define([
    'dojo/text!./templates/RelatedTables.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/request',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'app/config'
], function(
    template,

    declare,
    array,
    request,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    config
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      Queries and displays related table records

        templateString: template,
        baseClass: 'related-tables',
        widgetsInTemplate: true,

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.search.RelatedTables::postCreate', arguments);

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.search.RelatedTables::setupConnections', arguments);

        },
        getRelatedFeatures: function (item) {
            // summary:
            //      description
            // item: Object
            console.log('app/search/RelatedTables:getRelatedFeatures', arguments);
        
            var url = config.urls.DEQEnviro + '/' + item.parent;
            request(url, {
                handleAs: 'json',
                query: {f: 'json'}
            }).then(function (layerProps) {
                array.forEach(layerProps.relationships, function (rel) {
                    request(url + '/queryRelatedRecords', {
                        handleAs: 'json',
                        query: {
                            f: 'json',
                            objectIds: [item.OBJECTID],
                            relationshipId: rel.id,
                            outFields: '*',
                            returnGeometry: false
                        }
                    }).then(function (relatedResponse) {
                        // should only ever be one group since we are only passing in one objectid
                        if (relatedResponse.relatedRecordGroups.length > 0) {
                            console.log(relatedResponse.relatedRecordGroups[0].relatedRecords);
                        }
                    });
                });
            });
        }
    });
});