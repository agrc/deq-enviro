define([
    'dojo/_base/declare',
    'dojo/_base/array',

    'dojo/string',

    'app/search/SiteName'
], function(
    declare,
    array,

    dojoString,

    SiteName
) {
    return declare([SiteName], {
        // description:
        //      Provide functionality to allow users to search by additional fields for individual query layers.

        baseClass: 'additional-search site-name pad',

        paramName: 'defQuery',

        // Properties to be sent into constructor

        // fieldName: String
        fieldName: null,

        // fieldType: String
        fieldType: null,

        // fieldAlias: String
        fieldAlias: null,

        constructor: function (params) {
            // summary:
            //      description
            // params: Object
            console.log('app/search/AdditionalSearch:constructor', arguments);
        
            this.baseClass += ' ' + params.fieldType;
        },
        getSearchParam: function () {
            // summary:
            //      overriden from SiteName to provide the defQuery param
            console.log('app/search/AdditionalSearch:getSearchParam', arguments);

            this.inherited(arguments);
        
            var query;
            var that = this;
            if (this.fieldType === 'text') {
                var separator = (this.allRadio.checked) ? ' AND ' : ' OR ';
                var queries = [];
                var template = 'upper(${0}) LIKE upper(\'%${1}%\')';
                array.forEach(this.textBox.value.split(' '), function (word) {
                    queries.push(
                        dojoString.substitute(template, [that.fieldName, word])
                    );
                });
                query = queries.join(separator);
            } else {
                query = that.fieldName + ' = ' + this.textBox.value;
            }

            return query;
        }
    });
});