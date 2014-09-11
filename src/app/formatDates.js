define([
    'dojo/_base/array'
], function (
    array
    ) {
    var dateFieldsCache = {};

    return {
        formatAttributes: function (record, fields) {
            // summary:
            //      A function for looping through all of the attributes of a feature
            //      and formatting it's date field values
            // record: esri/Graphic
            // fields: FieldInfos[]
            console.log('app/formatDates', arguments);

            // get list of date fields
            // cache so that we don't do this multiple times for features
            // within the same table
            var fieldsHash = JSON.stringify(fields);
            var dateFields;
            if (!dateFieldsCache[fieldsHash]) {
                dateFields = [];
                array.forEach(fields, function (f) {
                    if (f.type === 'esriFieldTypeDate') {
                        dateFields.push(f.name);
                    }
                });
            } else {
                dateFields = dateFieldsCache[fieldsHash];
            }

            var atts = record.attributes;
            for (var prop in atts) {
                if (atts.hasOwnProperty(prop)) {
                    if (array.indexOf(dateFields, prop) > -1) {
                        atts[prop] = this.getDate(atts[prop]);
                    }
                }
            }
        },
        getDate: function (time) {
            if (time) {
                // dates are returned from arcgis server in MDT
                // Date() assumes UTC so we need to add the timezone offset
                return new Date(time + new Date(time).getTimezoneOffset() * 60000).toLocaleDateString();
            } else {
                return 'null';
            }
        }
    };
});