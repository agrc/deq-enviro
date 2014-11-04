define([
    'dojo/text!./templates/FieldFilter.html',

    'dojo/_base/declare',
    'dojo/_base/array',

    'app/search/_RadioCheckboxMixin',
    'app/Checkbox'
], function(
    template,

    declare,
    array,

    _RadioCheckboxMixin,
    Checkbox
) {
    return declare([_RadioCheckboxMixin], {
        // description:
        //      Filter by values and descriptions for a single field using checkboxes.

        templateString: template,
        baseClass: 'field-filter',

        itemClass: Checkbox,

        // fieldName: String
        fieldName: null,

        // fieldType: String
        //      text || number
        fieldType: null,

        // queryPrefix: String
        //      options prefix to add to the beginning of the query
        queryPrefix: null,


        // Properties to be sent into constructor


        postCreate: function () {
            // summary:
            //      strip off field name
            console.log('app/search/FieldFilter:postCreate', arguments);
        
            var parts = this.filterTxt.split(', ');
            var reg = /(^.+?)\|(.+?)\s\((.+)\)$/;
            var skip = 1;

            var fParts = reg.exec(parts[0]);

            if (fParts[1] === 'query') {
                this.queryPrefix = fParts[3];
                fParts = reg.exec(parts[1]);
                skip = 2;
            }

            this.fieldName = fParts[1];
            this.fieldType = fParts[2];
            this.label.innerHTML = fParts[3];

            this.filterTxt = parts.slice(skip).join(', ');

            this.inherited(arguments);
        },
        getQuery: function () {
            // summary:
            //      description
            console.log('app/search/FieldFilter:getQuery', arguments);
        
            var values = this.getSelectedValues();
            var query;

            if (values.length) {
                if (this.fieldType === 'text') {
                    query = this.fieldName + ' IN (\'' + values.join('\', \'') + '\')';
                } else {
                    query = this.fieldName + ' IN (' + values.join(', ') + ')';
                }

                if (!this.queryPrefix) {
                    return query;
                } else {
                    // add one ")" for each "(" found in the prefix
                    var postfix = '';
                    array.forEach(new Array(this.queryPrefix.split('(').length - 1), function () {
                        postfix += ')';
                    });

                    return (!this.queryPrefix) ? query : this.queryPrefix + ' ' + query + postfix;
                }
            } else {
                return null;
            }
        }
    });
});