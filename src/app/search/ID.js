define([
    'dojo/text!./templates/ID.html',

    'dojo/_base/declare',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin'
], function(
    template,

    declare,

    _WidgetBase,
    _TemplatedMixin
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Widget that allows the user to search for features by id.

        templateString: template,
        baseClass: 'id pad',

        // invalidMsg: String
        //      validation message for empty text box
        invalidMsg: 'You must input at least one character!',

        // Properties to be sent into constructor

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.search.ID::postCreate', arguments);

            this.inherited(arguments);
        },
        getSearchParam: function () {
            // summary:
            //      returns the search parameters
            // returns: String
            console.log('app.search.ID::getSearchParam', arguments);
        
            var value = this.textBox.value.trim();
            if (value === '') {
                throw this.invalidMsg;
            }

            return value;
        }
    });
});