define([
    'dojo/text!./templates/CheckboxFilter.html',

    'dojo/_base/declare',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'app/search/_RadioCheckboxMixin',
    'app/Checkbox'
], function (
    template,

    declare,

    _WidgetBase,
    _TemplatedMixin,

    _RadioCheckboxMixin,
    Checkbox
) {
    return declare([_RadioCheckboxMixin], {
        // description:
        //      Builds queries from checkboxes

        templateString: template,
        baseClass: 'checkbox-filter',

        itemClass: Checkbox
    });
});
