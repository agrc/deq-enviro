require([
    'app/formatDates'
], function (
    formatDates
    ) {
    var record;
    var fields = [{
        'name': 'EMPTY',
        'type': 'esriFieldTypeDate'
    }, {
        'name': 'NORMAL',
        'type': 'esriFieldTypeDate'
    }, {
        'name': 'ANOTHERFIELD',
        'type': 'esriFieldTypeString'
    }, {
        'name': 'MDT',
        'type': 'esriFieldTypeDate'
    }];

    describe('app/formatDates', function () {
        beforeEach(function () {
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
        });

        it('it changes milliseconds (MDT) to a date string', function () {
            expect(typeof record.attributes.NORMAL).toBe('string');
        });

        it('it doesn\'t touch non-date fields', function () {
            expect(record.attributes.ANOTHERFIELD).toBe('blah');
        });

        it('returns null for empty values', function () {
            expect(record.attributes.EMPTY).toBe('null');
        });

        it('handles MDT values', function () {
            expect(record.attributes.MDT.slice(-9)).toBe('1/20/1980');
        });
    });
});