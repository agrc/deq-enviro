define([
    'dojo/text!./templates/QueryLayer.html',

    'dojo/_base/declare',
    'dojo/_base/Color',
    'dojo/topic',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    '../config'

], function(
    template,

    declare,
    Color,
    topic,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    config
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

        // color: Number[]
        //      color of layer in map service, comes from json file
        color: null,

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app/QueryLayer::postCreate', arguments);

            var that = this;
            
            this.localStorageID = this.name + '_checkedState';

            if (localStorage) {
                if (localStorage[this.localStorageID] === 'true') {
                    this.checkbox.checked = true;
                    this.onCheckboxChange();
                }
            }

            $(this.helpTip).tooltip({
                container: 'body'
            });

            this.own(topic.subscribe(config.topics.appSearch.clear, function () {
                that.checkbox.checked = false;
                that.onCheckboxChange();
            }));

            this.inherited(arguments);
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
        },
        toJson: function () {
            // summary:
            //      Returns an object with id and defQuery props.
            //      Used by search to pass to the search api.
            console.log('app/QueryLayer::toJson', arguments);
        
            return {
                id: this.index,
                defQuery: this.defQuery
            };
        }
    });
});
