define([
    'dojo/text!./templates/Checkbox.html',

    'dojo/_base/declare',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin'
], function (
    template,

    declare,

    _WidgetBase,
    _TemplatedMixin
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Make it easier to generate bootstrap checkboxes programmatically.

        templateString: template,
        baseClass: 'checkbox',

        // checked: Boolean
        checked: false,


        // properties passed in via the constructor

        // value: String
        value: null,

        // label: String
        label: null,

        onChange: function () {
            // summary:
            //      description
            console.log('Checkbox:onChange', arguments);

        },
        clear: function () {
            // summary:
            //      description
            console.log('Checkbox:clear', arguments);

            this.item.checked = false;
        }
    });
});
