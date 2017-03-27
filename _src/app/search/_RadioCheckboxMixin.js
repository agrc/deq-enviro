define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/dom-construct',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin'
], function (
    declare,
    array,
    lang,
    domConstruct,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      Shared code between radio and checkbox filters

        widgetsInTemplate: false,

        // items: Checkbox or Radio
        items: null,

        // Properties to be sent into constructor

        // filterTxt: String
        filterTxt: null,

        constructor: function () {
            // summary:
            //      description
            console.log('app/search/_RadioCheckboxMixin:constructor', arguments);

            this.items = [];
        },
        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.log('app.search._RadioCheckboxMixin::postCreate', arguments);

            var that = this;
            array.forEach(this.filterTxt.split(', '), function (txt) {
                var parts = /(^.+?)\s\((.+)\)$/.exec(txt);
                var item = new that.itemClass({ // eslint-disable-line new-cap
                    value: parts[1],
                    label: parts[2],
                    name: that.id + '_radio'
                }, domConstruct.create('div', null, that.domNode));
                that.own(item);
                that.own(item.on('change', lang.hitch(that, 'onChange')));
                that.items.push(item);
            });

            this.inherited(arguments);
        },
        onChange: function () {
            // summary:
            //      description
            console.log('app/search/_RadioCheckboxMixin:onChange', arguments);

        },
        isValid: function () {
            // summary:
            //      description
            // returns: Boolean
            console.log('app/search/_RadioCheckboxMixin:isValid', arguments);

            return true;
        },
        getSelectedValues: function () {
            // summary:
            //      returns the values of the selected items
            console.log('app/search/_RadioCheckboxMixin:getSelectedValues', arguments);

            var queries = [];

            array.forEach(this.items, function (c) {
                if (c.item.checked) {
                    queries.push(c.value);
                }
            });

            return queries;
        },
        getQuery: function () {
            // summary:
            //      assembles the queries
            // returns: String | Null (if no items are checked)
            console.log('app/search/_RadioCheckboxMixin:getQuery', arguments);

            var queries = this.getSelectedValues();

            return (queries.length) ? queries.join(' OR ') : null;
        },
        clear: function () {
            // summary:
            //      clears all checkboxes
            console.log('app/search/_RadioCheckboxMixin:clear', arguments);

            array.forEach(this.items, function (c) {
                c.clear();
            });
        }
    });
});
