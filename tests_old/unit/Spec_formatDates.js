define(function (require) {
    var formatDates = require('app/formatDates');
    const registerSuite = intern.getInterface('object').registerSuite;
    const expect = intern.getPlugin('chai').expect;

    var record;
    var fields = [{
        name: 'EMPTY',
        type: 'esriFieldTypeDate'
    }, {
        name: 'NORMAL',
        type: 'esriFieldTypeDate'
    }, {
        name: 'ANOTHERFIELD',
        type: 'esriFieldTypeString'
    }, {
        name: 'MDT',
        type: 'esriFieldTypeDate'
    }];

    registerSuite('app/formatDates', {
        beforeEach: function () {
            record = {
                attributes: {
                    EMPTY: '',
                    NORMAL: 1408385000000,
                    ANOTHERFIELD: 'blah',
                    MDT: 317178000000
                },
                geometry: {}
            };

            formatDates.formatAttributes(record, fields);
        },

        'it changes milliseconds (MDT) to a date string': function () {
            expect(typeof record.attributes.NORMAL).to.be.equal('string');
        },

        'it doesn\'t touch non-date fields': function () {
            expect(record.attributes.ANOTHERFIELD).to.be.equal('blah');
        },

        'returns null for empty values': function () {
            expect(record.attributes.EMPTY).to.be.equal('null');
        },

        'handles MDT values': function () {
            const position = -9;
            expect(record.attributes.MDT.slice(position)).to.be.equal('1/20/1980');
        }
    });
});
