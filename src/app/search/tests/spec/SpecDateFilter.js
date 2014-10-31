require([
    'app/search/DateFilter',

    'dojo/dom-construct'
], function(
    WidgetUnderTest,

    domConstruct
) {
    describe('app/search/DateFilter', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function() {
            widget = new WidgetUnderTest({
                filterTxt: 'Date_Discovered (Date Discovered)'
            }, domConstruct.create('div', null, document.body));
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a DateFilter', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('constructor', function () {
            it('parses the field name and alias', function () {
                expect(widget.fieldName).toBe('Date_Discovered');
                expect(widget.fieldAlias).toBe('Date Discovered');
            });
        });
        describe('isValid', function () {
            it('validates that both dates are present', function () {
                expect(widget.isValid()).toBe(false);

                $(widget.from).datepicker('update', new Date());

                expect(widget.isValid()).toBe(false);

                $(widget.to).datepicker('update', new Date());

                expect(widget.isValid()).toBe(true);
            });
        });
        describe('getQuery', function () {
            it('returns the appropriate query string', function () {
                $(widget.from).datepicker('update', new Date('10/18/2012'));
                $(widget.to).datepicker('update', new Date('12/28/2014'));

                expect(widget.getQuery())
                    .toBe('Date_Discovered >= date \'2012-10-18\' AND Date_Discovered <= date \'2014-12-28\'');
            });
        });
    });
});
