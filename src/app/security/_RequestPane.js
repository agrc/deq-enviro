define([
    'dojo/text!./templates/_RequestPane.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/dom-style',
    'dojo/aspect',
    'dojo/query',

    'ijit/widgets/authentication/_LoginRegisterRequestPane',

    'app/config',
    'app/security/_LayersMixin'
], function(
    template,

    declare,
    array,
    lang,
    domStyle,
    aspect,
    query,

    _LoginRegisterRequestPane,

    config,
    _LayersMixin
) {
    return declare([_LoginRegisterRequestPane, _LayersMixin], {
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
            var additionalProps = {
                additional: {
                    address: this.addressTxt.value,
                    city: this.cityTxt.value,
                    state: this.stateTxt.value,
                    phone: this.phoneTxt.value,
                    zip: this.zipTxt.value
                },
                accessRules: {
                    startDate: Date.now(),
                    endDate: new Date().setMonth(
                        parseInt(this.timeSelect.value, 10) +
                        new Date().getMonth()),
                    options: {
                        layers: this.getLayers(),
                        locationTxt: this.locationTxt.value
                    }
                }
            };

            return lang.mixin(additionalProps, this.inherited(arguments));
        },
        validate: function () {
            // summary:
            //      overrides to make additional fields required
            // console.log('app/security/_RequestPane:validate', arguments);

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

            this.buildLayerCheckboxes();
        }
    });
});
