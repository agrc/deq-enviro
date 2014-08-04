define([
    'dojo/text!./templates/RelatedTableGrid.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/store/Memory',
    'dojo/dom-construct',
    'dojo/dom-class',
    'dojo/on',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'dgrid/OnDemandGrid',
    'dgrid/extensions/ColumnResizer',

    'app/config'
], function(
    template,

    declare,
    array,
    Memory,
    domConstruct,
    domClass,
    on,

    _WidgetBase,
    _TemplatedMixin,

    Grid,
    ColumnResizer,

    config
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

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.search.RelatedTableGrid::postCreate', arguments);

            var tableInfo = config.getRelatedTableByIndex(this.tableId + '');
            var columns = array.map(tableInfo.fields, function (f) {
                return {field: f[0], label: f[1]};
            });
            var data = array.map(this.records, function (r) {
                return r.attributes;
            });
            this.createPill(this.pillsDiv, tableInfo.name);

            this.grid = new (declare([Grid, ColumnResizer]))({
                columns: columns,
                store: new Memory({
                    idProperty: 'OBJECTID',
                    data: data
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
        }
    });
});