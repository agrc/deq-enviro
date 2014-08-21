define([
    'dojo/text!./templates/RelatedTableGrid.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/store/Memory',
    'dojo/dom-construct',
    'dojo/dom-class',
    'dojo/on',
    'dojo/io-query',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'dgrid/OnDemandGrid',
    'dgrid/extensions/ColumnResizer',

    'app/config',
    'app/formatDates'
], function(
    template,

    declare,
    array,
    lang,
    Memory,
    domConstruct,
    domClass,
    on,
    ioQuery,

    _WidgetBase,
    _TemplatedMixin,

    Grid,
    ColumnResizer,

    config,
    formatDates
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      A grid for showing data in a related table

        templateString: template,
        baseClass: 'tab-pane related-table-grid',

        // tab: node
        //      The anchor node associated with this tab
        tab: null,


        // Properties to be sent into constructor

        // records: Object[] || false
        //      The records as returned by the query related features service.
        //      All data is in the attributes property
        //      False is returned if not records where found
        records: null,

        // tableId: Number
        //      The index of the associated table within the map service
        //      Used to lookup info from the DEQEnviro.json file
        tableId: null,

        // pillsDiv: node
        //      The container where this widget will create it's associated pill
        pillsDiv: null,

        // fields: Object[]
        //      Field infos for this table
        fields: null,

        // fiveFields: Object
        //      The five main fields from the query layer feature that this table is
        //      related to
        fiveFields: null,

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.search.RelatedTableGrid::postCreate', arguments);

            var that = this;
            var tableInfo = config.getRelatedTableByIndex(this.tableId + '');
            var columns = array.map(tableInfo.fields, function (f) {
                var columnInfo = {field: f[0], label: f[1]};
                var fieldType;
                array.some(that.fields, function (fld) {
                    fieldType = fld.type;
                    return fld.name === f[0];
                });
                if (fieldType === 'esriFieldTypeDate') {
                    columnInfo.formatter = formatDates.getDate;
                }

                return columnInfo;
            });

            // add additional info link column
            columns.push({
                field: 'additionalInfo',
                label: 'Additional Info',
                renderCell: function (object, value, node) {
                    domConstruct.create('a', {
                        href: value,
                        innerHTML: 'info',
                        target: '_blank'
                    }, node);
                }
            });

            this.createPill(this.pillsDiv, tableInfo.name);

            this.grid = new (declare([Grid, ColumnResizer]))({
                columns: columns,
                store: new Memory({
                    idProperty: 'OBJECTID',
                    data: this.formatData(this.records,
                        tableInfo.additionalLink,
                        tableInfo.additionalLinkFields,
                        this.fiveFields)
                })
            }, this.gridDiv);

            this.inherited(arguments);
        },
        startup: function () {
            // summary:
            //      description
            console.log('app/search/RelatedTableGrid:startup', arguments);

            // add active class if this is the first tab
            if (this.domNode.parentElement.children.length === 1) {
                domClass.add(this.domNode, 'active');
                this.grid.startup();
            }

            this.inherited(arguments);
        },
        createPill: function (pillsContainer, name) {
            // summary:
            //      creates the pill associated with this pane
            // pillsContainer: node
            // name: String
            console.log('app/search/RelatedTableGrid:createPill', arguments);

            var isFirst = pillsContainer.children.length === 0;
            var li = domConstruct.create('li', {className: isFirst ? 'active' : ''}, pillsContainer);
            this.tab = domConstruct.create('a', {
                href: '#' + this.id,
                role: 'tab',
                'data-toggle': 'tab',
                innerHTML: name
            }, li);

            var that = this;
            // if this isn't the first tab then wire startup to fire
            // after tab is shown to enable appropriate layout calculations
            if (this.domNode.parentElement.children.length !== 1) {
                $(that.tab).one('shown.bs.tab', function () {
                    console.log('startup');
                    that.grid.startup();
                });
            }
        },
        destroy: function () {
            // summary:
            //      destroys widget and associated tab

            console.log('app/search/RelatedTableGrid:destroy', arguments);

            this.grid.destroy();

            domConstruct.destroy(this.tab.parentElement);

            this.inherited(arguments);
        },
        formatData: function (records, additionalLink, additionalLinkFields, fiveFields) {
            // summary:
            //      Flattens the records array and formats the dates.
            //      Also builds the additional info link
            // records: Object[]
            //      as returned from the get related records service
            // additionalLink: String
            // additionalLinkFields: String
            // fiveFields: Object
            console.log('app/search/RelatedTableGrid:formatData', arguments);

            return array.map(records, function (r) {
                var additionalFieldsData = {};
                array.forEach(additionalLinkFields.split(', '), function (f) {
                    additionalFieldsData[f] = r.attributes[f];
                });
                // additional info link
                r.attributes.additionalInfo = additionalLink + '?' +
                    ioQuery.objectToQuery(lang.mixin(fiveFields, additionalFieldsData));

                return r.attributes;
            });
        }
    });
});