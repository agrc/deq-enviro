define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/string',
    'dojo/query',

    'put-selector/put',

    'app/config'

], function(
    declare,
    array,
    lang,
    dojoString,
    query,

    put,

    config
) {
    return declare(null, {
        // description:
        //      Creates checkboxes for all available secured layers.



        buildLayerCheckboxes: function () {
            // summary:
            //      description
            console.log('app/security/_LayersMixin::buildLayerCheckboxes', arguments);

            var that = this;

            // load available secured layers
            return config.getAppJson().then(function (json) {
                array.forEach(json.queryLayers, function (ql) {
                    if (ql.secure === 'Yes') {
                        var putString = 'li.checkbox label input[type=checkbox][value=${index}]+span';
                        put(that.layersContainer, dojoString.substitute(putString, ql), ql.name);
                    }
                });
                query('input', that.layersContainer).on('change', lang.hitch(that, 'validate'));
            });
        },
        getLayers: function () {
            // summary:
            //      returns values for all selected layer checkboxs
            // returns: String[]
            console.log('app/security/_LayersMixin:getLayers', arguments);
            
            var layers = [];
            query('input', this.layersContainer).forEach(function (node) {
                if (node.checked) {
                    layers.push(node.value);
                }
            });

            return layers;
        }
    });
});