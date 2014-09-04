define([
    'dojo/text!./templates/Download.html',

    'dojo/_base/declare',

    'dojo/dom-class',

    'dojo/topic',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'app/config'
], function(
    template,

    declare,

    domClass,

    topic,

    _WidgetBase,
    _TemplatedMixin,

    config
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Hooks up to the search results grid and makes requests to a
        //      geoprocessing service to download data. issue #143

        templateString: template,
        baseClass: 'download',

        _setCountAttr: {
            node: 'countNode',
            type: 'innerHTML'
        },

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.download.Download::postCreate', arguments);

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.download.Download::setupConnections', arguments);

            var self = this;
            this.own(
                topic.subscribe(config.topics.appSearchResultsGrid.downloadFeaturesDefined, function(t) {
                    self.updateCount(t);
                }),
                this.watch('count', function(name, original, change){
                    self.updateVisibility(change);
                })
            );
        },
        updateCount: function(data) {
            // summary:
            //      receives the data from the search xhr and sets the count
            //      value of the label to the number of results
            // data - xhr search result from appSearch.downloadFeaturesDefined topic
            console.log('app.download.Download::updateCount', arguments);

            var count = 0;
            for (var key in data) {
                // make sure it's not from the prototype!
                if (data.hasOwnProperty(key)) {
                    count += data[key].length;
                }
            }

            this.set('count', count);

            return count;
        },
        updateVisibility: function(value) {
            // summary:
            //      enables and disables the download button based on result counts
            // value
            console.log('app.download.Download::updateButtonState', arguments);

            if(value > 0)
            {
                domClass.replace(this.domNode, 'show', 'hidden');
                return;
            }

            domClass.replace(this.domNode, 'hidden', 'show');
        }
    });
});
