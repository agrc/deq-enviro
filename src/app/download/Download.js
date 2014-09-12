define([
    'dojo/text!./templates/Download.html',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/topic',
    'dojo/dom-attr',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'ijit/modules/_ErrorMessageMixin',

    'agrc/modules/Formatting',

    'esri/tasks/Geoprocessor',

    'app/config',
    'app/map/MapController'
], function(
    template,

    declare,
    lang,
    domClass,
    topic,
    domAttr,

    _WidgetBase,
    _TemplatedMixin,

    _ErrorMessageMixin,

    formatting,

    Geoprocessor,

    config,
    MapController
) {
    return declare([_WidgetBase, _TemplatedMixin, _ErrorMessageMixin], {
        // description:
        //      Hooks up to the search results grid and makes requests to a
        //      geoprocessing service to download data. issue #143

        templateString: template,
        baseClass: 'download',

        _setCountAttr: {
            node: 'countNode',
            type: 'innerHTML'
        },

        // noFormatMsg: String
        noFormatMsg: 'Please select a download format below!',

        // genericErrMsg: String
        genericErrMsg: 'There was an error getting the download data!',

        // count: String
        //      The total number of selected features as a string with commas
        count: null,

        // downloadFeatures: Object
        //      A container holding the ids of the selected result features
        //      {
        //          featureClassName: ['C040', 'C039'],
        //          anotherFeatureClassName: ['1', '2', '3']
        //      }
        downloadFeatures: null,

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

            var that = this;
            this.own(
                topic.subscribe(config.topics.appSearchResultsGrid.downloadFeaturesDefined,
                    function(idMap, isSelection) {
                        that.updateCount(idMap);
                        that.downloadFeatures = idMap;
                        that.toggleSelectionBtn(isSelection);
                    }
                ),
                this.watch('count', function(name, original, change){
                    that.updateVisibility(change);
                }),
                topic.subscribe(config.topics.appSearch.clear, lang.hitch(this, 'clear')),
                topic.subscribe(config.topics.appSearch.searchStarted, lang.hitch(this, 'clear'))
            );
        },
        clear: function () {
            // summary:
            //      description
            console.log('app/download/Download:clear', arguments);

            this.set('count', '0');
            this.hideErrMsg();
            this.hideDownloadLink();
            this.toggleSelectionBtn(false);
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

            this.set('count', formatting.addCommas(count));

            return count;
        },
        updateVisibility: function(value) {
            // summary:
            //      enables and disables the download button based on result counts
            // value
            console.log('app.download.Download::updateButtonState', arguments);

            if(value !== '0')
            {
                domClass.replace(this.domNode, 'show', 'hidden');
                return;
            }

            domClass.replace(this.domNode, 'hidden', 'show');
        },
        download: function () {
            // summary:
            //      sends download request to gp tool if there are any selected features
            console.log('app/download/Download:download', arguments);

            this.hideErrMsg();

            var fileType = this.fileTypes.value;

            if (fileType === '') {
                this.showErrMsg(this.noFormatMsg);
                return;
            }

            this.showLoader();
            this.hideDownloadLink();

            if (!this.gp) {
                var that = this;
                this.gp = new Geoprocessor(config.urls.download);
                this.own(
                    this.gp.on('error', function () {
                        that.showErrMsg(that.genericErrMsg);
                        that.hideLoader();
                    }),
                    this.gp.on('job-complete', lang.hitch(this, 'onGPComplete')),
                    this.gp.on('get-result-data-complete', lang.hitch(this, 'showDownloadLink'))
                );
            }

            var params = {
                'feature_class_oid_map': JSON.stringify(this.downloadFeatures),
                'file_type': this.fileTypes.value
            };

            this.gp.submitJob(params);

            return params;
        },
        showLoader: function () {
            // summary:
            //      description
            console.log('app/download/Download:showLoader', arguments);

            this.downloadBtn.innerHTML = 'Processing Data';
            domAttr.set(this.downloadBtn, 'disabled', true);
            MapController.map.showLoader();
        },
        hideLoader: function () {
            // summary:
            //      description
            console.log('app/download/Download:hideLoader', arguments);

            this.downloadBtn.innerHTML = 'Download';
            domAttr.set(this.downloadBtn, 'disabled', false);
            MapController.map.hideLoader();
        },
        onGPComplete: function (response) {
            // summary:
            //      description
            // response: Object
            console.log('app/download/Download:onGPComplete', arguments);

            if (response.jobInfo.jobStatus === 'esriJobSucceeded') {
                this.gp.getResultData(response.jobInfo.jobId, config.parameterNames.output);
            } else {
                this.showErrMsg(this.genericErrMsg);
                this.hideLoader();
            }
        },
        showDownloadLink: function (response) {
            // summary:
            //      description
            // response: Object
            console.log('app/download/Download:showDownloadLink', arguments);

            this.downloadAnchor.href = response.result.value.url;
            domClass.remove(this.downloadAnchorContainer, 'hidden');
            this.hideLoader();
        },
        hideDownloadLink: function () {
            // summary:
            //      description
            console.log('app/download/Download:hideDownloadLink', arguments);

            domClass.add(this.downloadAnchorContainer, 'hidden');
        },
        toggleSelectionBtn: function (show) {
            // summary:
            //      description
            // show: Boolean
            console.log('app/download/Download:toggleSelectionBtn', arguments);

            var classFunc = (show) ? domClass.remove : domClass.add;
            classFunc(this.selectedSpan, 'hidden');
            classFunc(this.clearSelectedBtn, 'hidden');
        },
        onClearSelected: function () {
            // summary:
            //      description
            console.log('app/download/Download:onClearSelected', arguments);

            topic.publish(config.topics.appDownloadDownload.clearSelection);
        }
    });
});
