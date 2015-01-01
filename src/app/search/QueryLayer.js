define([
    'dojo/text!./templates/QueryLayer.html',

    'dojo/_base/declare',
    'dojo/_base/Color',
    'dojo/_base/array',
    'dojo/topic',
    'dojo/dom-class',
    'dojo/request',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'app/config',
    'app/search/QueryLayerFilter'

], function(
    template,

    declare,
    Color,
    array,
    topic,
    domClass,
    request,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    config,
    QueryLayerFilter
) {
    var topics = config.topics.appQueryLayer;
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      Encapsulates the query layer controls and functionality.

        templateString: template,
        baseClass: 'query-layer',
        widgetsInTemplate: true,

        // localStorageID: String
        localStorageID: null,

        popupDelay: config.popupDelay,

        // filter: QueryLayerFilter
        filter: null,


        // Properties to be sent into constructor

        // name: String
        //      The name of the query layer
        name: null,

        // index: Number
        //      The index of the layer within the query layers map service
        index: null,

        // description: String
        //      The text that you want to show up in the popup
        description: null,

        // metaDataUrl: String
        //      The URL for the metadata page for this layer.
        //      The help button is linked to this URL
        metaDataUrl: null,

        // defQuery: String
        //      The definition query applied to this query layer.
        //      This will be set using layer filters in the future.
        defQuery: null,

        // All of the fields in config.fieldNames.queryLayers

        // secure: String (Yes | No)
        secure: 'No',

        // specialFilters: String
        specialFilters: null,

        // specialFiltersDefaultOn: String
        specialFiltersDefaultOn: null,

        // additionalSearches: String
        additionalSearches: null,

        // additionalSearchObjects: Object[]
        //      holds init props for associated AdditionalSearch widgets
        additionalSearchObjects: null,


        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app/QueryLayer::postCreate', arguments);

            var that = this;

            if (this.additionalSearches && this.additionalSearches !== 'n/a') {
                var reg = /(^.+?)\|(.+?)\s\((.+)\)$/;
                this.additionalSearchObjects = [];
                array.forEach(this.additionalSearches.split(', '), function (txt) {
                    var parts = reg.exec(txt);
                    that.additionalSearchObjects.push({
                        fieldName: parts[1],
                        fieldType: parts[2],
                        fieldAlias: parts[3]
                    });
                });
            }

            if (this.secure === 'Yes') {
                this.checkSecurity(config.user);
                this.own(
                    topic.subscribe(config.topics.app.onSignInSuccess, function (loginResult) {
                        that.checkSecurity(loginResult.user);
                    })
                );
            }

            this.localStorageID = this.name + this.index + '_checkedState';

            this.rememberCheckedState();

            $(this.helpTip).tooltip({
                container: 'body'
            });
            if (this.secure === 'Yes') {
                $(this.secureTip).tooltip({
                    container: 'body'
                });
            }

            this.own(
                topic.subscribe(config.topics.appSearch.clear, function () {
                    that.checkbox.checked = false;
                    that.onCheckboxChange();
                })
            );

            if (this.specialFilters !== 'n/a') {
                domClass.remove(this.filterIcon, 'hidden');

                // hack to make points of diversion default to be on
                if (this.specialFiltersDefaultOn === 'Y') {
                    this.initFilter();
                    this.filter.filters[0].items[0].item.click();
                    this.filter.onApplyBtnClick();
                }
            }

            this.inherited(arguments);
        },
        rememberCheckedState: function () {
            // summary:
            //      updates checkbox from localstorage value
            console.log('app/QueryLayer:rememberCheckedState', arguments);

            if (localStorage) {
                if (localStorage[this.localStorageID] === 'true' &&
                    !this.checkbox.disabled) {
                    this.checkbox.checked = true;
                    this.onCheckboxChange();
                }
            }
        },
        checkSecurity: function (user) {
            // summary:
            //      checks that the user has permissions to this layer then disables/enables
            //      appropriately
            console.log('app/QueryLayer:checkSecurity', arguments);

            this.toggleDisabledState(
                user === null ||
                array.indexOf(user.accessRules.options.layers, this.index) === -1
            );
            this.rememberCheckedState();
        },
        onCheckboxChange: function () {
            // summary:
            //      Fires when checkbox checked state changes
            console.log('app/QueryLayer:onCheckboxChange', arguments);

            var checked = this.checkbox.checked;

            if (localStorage) {
                localStorage[this.localStorageID] = checked;
            }

            var t = (checked) ? topics.addLayer : topics.removeLayer;

            topic.publish(t, this);

            this.requestSymbology();
        },
        requestSymbology: function () {
            // summary:
            //      description
            console.log('app/QueryLayer:requestSymbology', arguments);

            if (this.ENVIROAPPSYMBOL !== 'n/a' && !this.requestedSymbology) {
                var url;
                if (this.secure === 'Yes') {
                    url = config.urls.secure + '/' + this.index.slice(1) + '?f=json&token=' + config.user.token;
                } else {
                    url = config.urls.DEQEnviro + '/' + this.index + '?f=json';
                }
                var that = this;
                request(url, {handleAs: 'json'}).then(function (json) {
                    config.getQueryLayerByIndex(that.index).renderer = json.drawingInfo.renderer;
                });
                this.requestedSymbology = true;
            }
        },
        toJson: function () {
            // summary:
            //      Returns an object with id and defQuery props.
            //      Used by search to pass to the search api.
            console.log('app/QueryLayer::toJson', arguments);

            return {
                id: (this.secure === 'No') ? this.index : this.index.slice(1),
                defQuery: this.defQuery
            };
        },
        toggleDisabledState: function (disable) {
            // summary:
            //      Toggles the disabled state of this widget
            console.log('app/QueryLayer:toggleDisabledState', arguments);

            var classFunc = (disable) ? domClass.add : domClass.remove;
            classFunc(this.domNode, 'disabled');
            this.checkbox.disabled = disable;
        },
        initFilter: function () {
            // summary:
            //      sets up the filter widget
            console.log('app/QueryLayer:initFilter', arguments);

            var that = this;

            this.filter = new QueryLayerFilter({
                popoverBtn: this.filterIcon,
                filterTxt: this.specialFilters
            });
            this.filter.on('apply', function (query) {
                that.defQuery = query;
                domClass.add(that.filterIcon, 'enabled');
            });
            this.filter.on('clear', function () {
                that.defQuery = null;
                domClass.remove(that.filterIcon, 'enabled');
            });
        },
        showFilter: function (evt) {
            // summary:
            //      Shows the filter popup
            // evt: Click Event Object
            console.log('app/QueryLayer:showFilter', arguments);

            this.stopClick(evt);

            if (!this.filter) {
                this.initFilter();
                this.filter.show();
            }
        },
        stopClick: function (evt) {
            // summary:
            //      Stops the default click behavior
            // evt: Click Event Object
            console.log('app/QueryLayer:stopClick', arguments);

            evt.preventDefault();
            evt.stopPropagation();
        },
        onHelpTipClick: function (evt) {
            // summary:
            //      fix bug in IE10+ that causes the checkbox to toggle
            //      when clicking on the help tip
            // evt: mouse click object
            console.log('app/QueryLayer:onHelpTipClick', arguments);
        
            evt.preventDefault();
            window.open(this.helpTip.href, 'new');
        }
    });
});
