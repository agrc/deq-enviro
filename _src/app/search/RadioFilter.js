define([
    'dojo/text!./templates/RadioFilter.html',
    'dojo/text!./templates/_RadioBtn.html',

    'dojo/_base/declare',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'app/search/_RadioCheckboxMixin'
], function (
    template,
    radioTemplate,

    declare,

    _WidgetBase,
    _TemplatedMixin,

    _RadioCheckboxMixin
) {
    var Radio = declare([_WidgetBase, _TemplatedMixin], {
        templateString: radioTemplate,
        baseClass: 'radio',

        // checked: Boolean
        checked: false,


        // properties passed in via the constructor

        // value: String
        value: null,

        // label: String
        label: null,

        // name: String
        name: null,

        onChange: function () {
            // summary:
            //      description
            console.log('Radio:onChange', arguments);

        },
        clear: function () {
            // summary:
            //
            console.log('Radio:clear', arguments);

            this.item.checked = false;
        }
    });

    return declare([_RadioCheckboxMixin], {
        // description:
        //      Query layer filter by radio button

        templateString: template,
        baseClass: 'radio-filter',

        itemClass: Radio
    });
});
