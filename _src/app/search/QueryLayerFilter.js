define([
    'dojo/text!./templates/QueryLayerFilter.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/dom-construct',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'app/_PopoverMixin',
    'app/search/DateFilter',
    'app/search/CheckboxFilter',
    'app/search/RadioFilter',
    'app/search/FieldFilter'
], function (
    template,

    declare,
    array,
    lang,
    domConstruct,

    _WidgetBase,
    _TemplatedMixin,

    _PopoverMixin,
    DateFilter,
    CheckboxFilter,
    RadioFilter,
    FieldFilter
) {
    return declare([_WidgetBase, _TemplatedMixin, _PopoverMixin], {
        // description:
        //      Provides controls for filtering query layers

        templateString: template,
        baseClass: 'query-layer-filter',

        // filterTypes: Object
        filterTypes: {
            date: DateFilter,
            checkbox: CheckboxFilter,
            radio: RadioFilter,
            field: FieldFilter
        },

        // filters: Object[]
        //      collection of filters for this widget
        filters: null,

        // filters must implement the following methods
        // isValid, onChange, getQuery, & clear


        // Properties to be sent into constructor

        // filterTxt: String
        //      e.g. date: Date_Discovered (Date Discovered)
        filterTxt: null,

        constructor: function () {
            // summary:
            //      description
            console.log('app/search/QueryLayerFilter:constructor', arguments);

            this.filters = [];
        },
        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.search.QueryLayerFilter::postCreate', arguments);

            var that = this;
            this.filterTxt.split('; ').forEach(function (txt, index) {
                var parts = /(^.+?):\s(.+$)/.exec(txt);
                if (index > 0) {
                    domConstruct.create('hr', null, that.filtersContainer);
                }
                var f = new that.filterTypes[parts[1]]({
                    filterTxt: parts[2]
                }, domConstruct.create('div', null, that.filtersContainer));
                f.on('change', lang.hitch(that, 'validate'));
                that.filters.push(f);
                that.own(f);
            });

            this.inherited(arguments);
        },
        validate: function () {
            // summary:
            //      description
            console.log('app/search/QueryLayerFilter:validate', arguments);

            this.applyBtn.disabled = !array.every(this.filters, function (f) {
                return f.isValid();
            });
        },
        onApply: function (query) {
            // summary:
            //      applys the filter to the query layer
            console.log('app/search/QueryLayerFilter:onApply', arguments);

            return query;
        },
        onApplyBtnClick: function () {
            // summary:
            //      apply button click handler
            console.log('app/search/QueryLayerFilter:onApplyBtnClick', arguments);

            var queries = [];

            array.forEach(this.filters, function (f) {
                var q = f.getQuery();
                if (q) {
                    queries.push(q);
                }
            });

            this.onApply((queries.length > 0) ? queries.join(' AND ') : null);

            this.hide();
        },
        onClear: function () {
            // summary:
            //      clears all filters
            console.log('app/search/QueryLayerFilter:onClear', arguments);

            array.forEach(this.filters, function (f) {
                f.clear();
            });
            this.hide();
        }
    });
});
