define([
    'dojo/text!./templates/Legend.html',
    'dojo/text!./templates/LegendRow.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/request',
    'dojo/dom-construct',
    'dojo/string',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin'
], function(
    template,
    rowTemplate,

    declare,
    array,
    request,
    domConstruct,
    dojoString,

    _WidgetBase,
    _TemplatedMixin
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Builds a legend for a specific layer within a map service.

        templateString: template,
        baseClass: 'legend',

        // Properties to be sent into constructor
        // mapServiceUrl: String
        //      The url to the map service that the layer is within
        mapServiceUrl: null,

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.map.Legend::postCreate', arguments);

            var that = this;
            var params = {
                query: {f: 'json'},
                handleAs: 'json'
            };
            request.get(this.mapServiceUrl + '/legend', params)
                .then(function (response) {
                    array.some(response.layers, function (lyr) {
                        if (lyr.layerId === that.layerId) {
                            that.buildLegend(lyr.legend);
                            return true;
                        }
                    });
                });
        },
        buildLegend: function (items) {
            // summary:
            //      builds the legend elements from the items array
            // items: Object[]
            console.log('app.map.Legend::buildLegend', arguments);
        
            var that = this;
            array.forEach(items, function (item) {
                domConstruct.place(dojoString.substitute(rowTemplate, item), that.table);
            });

            this.emit('legend-built');
        }
    });
});