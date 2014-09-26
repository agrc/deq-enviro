define([
    'dojo/text!./templates/_RequestPane.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/dom-style',
    'dojo/aspect',
    'dojo/string',
    'dojo/query',

    'put-selector/put',

    'ijit/widgets/authentication/_LoginRegisterRequestPane',

    'app/config'
], function(
    template,

    declare,
    array,
    lang,
    domStyle,
    aspect,
    dojoString,
    query,

    put,

    _LoginRegisterRequestPane,

    config
) {
    return declare([_LoginRegisterRequestPane], {
        // description:
        //      Override of ijit/widgets/authentication/_LoginRegisterRequestPane to add more fields.

        templateString: template,
        baseClass: 'request-pane',
        widgetsInTemplate: true,

        // width: Number
        //      the custom width of the dialog
        width: 630,

        getData: function () {
            // summary:
            //      description
            console.log('app/security/_RequestPane:getData', arguments);
            var layers = [];

            query('input', this.layersContainer).forEach(function (node) {
                if (node.checked) {
                    layers.push(node.value);
                }
            });
            var options = {
                address: this.addressTxt.value,
                city: this.cityTxt.value,
                state: this.stateTxt.value,
                phone: this.phoneTxt.value,
                zip: this.zipTxt.value,
                layers: layers,
                locationTxt: this.locationTxt.value,
                timePeriod: this.timeSelect.value
            };

            return lang.mixin({options: options}, this.inherited(arguments));
        },
        validate: function () {
            // summary:
            //      overrides to make additional fields required
            console.log('app/security/_RequestPane:validate', arguments);

            arguments[0].charCode = null;
            arguments[0].keyCode = null;

            var valid = (this.timeSelect.value !== '' &&
                query('input', this.layersContainer).some(function (node) {
                    return node.checked;
                }) &&
                this.locationTxt.value.length > 0
            );

            return valid && this.inherited(arguments);
        },
        postCreate: function () {
            // summary:
            //      override to increase size of dialog
            console.log('app/security/_RequestPane:postCreate', arguments);

            this.inherited(arguments);

            // increase the parent model to allow for the bigger size of this pane
            var that = this;
            aspect.after(this.parentWidget, 'goToPane', function (pane) {
                var width = (pane === that) ? that.width + 'px' : '';
                domStyle.set(that.parentWidget.modalDialog, 'width', width);
            }, true);

            // load available secured layers
            config.getAppJson().then(function (json) {
                array.forEach(json.queryLayers, function (ql) {
                    if (ql.secure === 'Yes') {
                        var putString = 'li.checkbox label input[type=checkbox][value=${index}]+span';
                        put(that.layersContainer, dojoString.substitute(putString, ql), ql.name);
                    }
                });
                query('input', that.layersContainer).on('change', lang.hitch(that, 'validate'));
            });
        }
    });
});
