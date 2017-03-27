define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/dom-construct',
    'dojo/string',
    'dojo/text!./templates/Legend.html',
    'dojo/text!./templates/LegendRow.html',

    // use esri/request so that LoginRegister can add token if needed
    'esri/request'
], function (
    _TemplatedMixin,
    _WidgetBase,

    array,
    declare,
    domConstruct,
    dojoString,
    template,
    rowTemplate,

    request
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

        // layerId: Number
        //      The layer within the that you want the legend for.
        layerId: null,

        // header: String (optional)
        //      text that shows above the legend items
        header: null,

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.map.Legend::postCreate', arguments);

            var that = this;
            var requestObj = {
                url: this.mapServiceUrl + '/legend',
                content: {f: 'json'}
            };
            request(requestObj).then(function (response) {
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
