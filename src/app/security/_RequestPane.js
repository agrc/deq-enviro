define([
    'dojo/text!./templates/_RequestPane.html',

    'dojo/_base/declare',
    'dojo/dom-style',
    'dojo/aspect',

    'ijit/widgets/authentication/_LoginRegisterRequestPane'
], function(
    template,

    declare,
    domStyle,
    aspect,

    _LoginRegisterRequestPane
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
        }
    });
});
