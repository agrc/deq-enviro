require([
    'app/search/FieldFilter',

    'dojo/dom-construct'
], function(
    WidgetUnderTest,

    domConstruct
) {
    describe('app/search/FieldFilter', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function() {
            widget = new WidgetUnderTest({
                filterTxt: 'WELL_STATUS_MAIN|text (Well Status), A (Active (service well)), APD ' +
                    '(Approved Permit (not yet spudded)), DRL (Drilling (Spudded ' +
                    'but not yet complete)), OPS (Drilling Operations Suspended), I ' +
                    '(Inactive), LA (Location Abandoned), NEW (New Permit (Not yet approved ' +
                    'or drilled)), PA (Plugged and Abandoned), P (Producing), RET (Returned ' +
                    'APD (Unapproved)), S (Shut-In), TA (Temporarily-Abandoned)'
            }, domConstruct.create('div', null, document.body));
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a FieldFilter', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('postCreate', function () {
            it('creates the checkboxes', function () {
                expect(widget.items.length).toBe(12);
            });
            it('strips off the field name', function () {
                expect(widget.fieldName).toBe('WELL_STATUS_MAIN');
                expect(widget.label.innerHTML).toBe('Well Status');
                expect(widget.filterTxt).toBe('A (Active (service well)), APD ' +
                    '(Approved Permit (not yet spudded)), DRL (Drilling (Spudded ' +
                    'but not yet complete)), OPS (Drilling Operations Suspended), I ' +
                    '(Inactive), LA (Location Abandoned), NEW (New Permit (Not yet approved ' +
                    'or drilled)), PA (Plugged and Abandoned), P (Producing), RET (Returned ' +
                    'APD (Unapproved)), S (Shut-In), TA (Temporarily-Abandoned)');
                expect(widget.fieldType).toBe('text');
            });
        });
        describe('getQuery', function () {
            it('returns the correct query', function () {
                widget.items[0].item.click();
                widget.items[3].item.click();
                widget.items[4].item.click();

                expect(widget.getQuery()).toBe('WELL_STATUS_MAIN IN (\'A\', \'OPS\', \'I\')');
            });
            it('doesn\'t wrap values with quote for number fields', function () {

                var widget2 = new WidgetUnderTest({
                    filterTxt: 'WELL_STATUS_MAIN|number (Well Status), 1 (Abandoned), 2 (Test)'
                }, domConstruct.create('div', null, document.body));

                widget2.items[0].item.click();
                widget2.items[1].item.click();

                expect(widget2.getQuery()).toBe('WELL_STATUS_MAIN IN (1, 2)');

                destroy(widget2);
            });
        });
        describe('queryPrefix', function () {
            it('should prepend the queryPrefix and append a ")"', function () {
                var widget2 = new WidgetUnderTest({
                    popoverBtn: domConstruct.create('a'),
                    filterTxt: 'query|prefix (GUID IN (SELECT Facility_FK FROM UICWell WHERE), ' +
                        'WELL_STATUS_MAIN|text (Well Status), A (Active (service well)), APD ' +
                        '(Approved Permit (not yet spudded))'
                }, domConstruct.create('div', null, document.body));

                widget2.items[0].item.click();
                widget2.items[1].item.click();

                expect(widget2.getQuery()).toBe('GUID IN (SELECT Facility_FK FROM UICWell WHERE ' +
                    'WELL_STATUS_MAIN IN (\'A\', \'APD\'))');

                destroy(widget2);
            });
            it('appends the correct number of ")"\'s depending on how many are in the prefix', function () {
                var widget2 = new WidgetUnderTest({
                    popoverBtn: domConstruct.create('a'),
                    filterTxt: 'query|prefix (GUID IN (SELECT Facility_FK FROM UICWell WHERE GUID IN ' +
                        '(SELECT Well_FK FROM UICWellOperatingStatus WHERE), ' +
                        'WELL_STATUS_MAIN|text (Well Status), A (Active (service well)), APD ' +
                        '(Approved Permit (not yet spudded))'
                }, domConstruct.create('div', null, document.body));

                widget2.items[0].item.click();
                widget2.items[1].item.click();

                expect(widget2.getQuery()).toBe('GUID IN (SELECT Facility_FK FROM UICWell WHERE GUID IN ' +
                    '(SELECT Well_FK FROM UICWellOperatingStatus WHERE ' +
                    'WELL_STATUS_MAIN IN (\'A\', \'APD\')))');

                destroy(widget2);
            });
        });
    });
});