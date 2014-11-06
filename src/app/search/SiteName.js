define([
    'dojo/text!./templates/SiteName.html',

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
        //      Provides controls for the user to search for terms within the SiteName field

        templateString: template,
        baseClass: 'site-name pad',

        // invalidMsg: String
        invalidMsg: 'You must input at least one search term!',

        // paramName: String
        //      The name of the parameter for the search service associated with this widget
        paramName: 'siteName',

        // Properties to be sent into constructor

        getSearchParam: function () {
            // summary:
            //      returns the appropriately formatted search object
            // returns: {}
            console.log('app/search/SiteName::getSearchParam', arguments);
        
            if (this.textBox.value.trim() === '') {
                throw this.invalidMsg;
            }

            return {
                terms: this.textBox.value.trim().split(' '),
                includeAll: this.allRadio.checked
            };
        },
        clear: function () {
            // summary:
            //      clears out the text box
            console.log('app/search/SiteName:clear', arguments);
        
            this.textBox.value = '';
        }
    });
});