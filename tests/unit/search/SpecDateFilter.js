/* eslint-disable no-unused-expressions, no-magic-numbers */
define([
    'app/search/DateFilter',

    'dojo/dom-construct',

    'intern!bdd',

    'intern/chai!expect',

    'jquery'
], function (
    WidgetUnderTest,

    domConstruct,

    bdd,

    expect
) {
    bdd.describe('app/search/DateFilter', function () {
        var widget;
        var destroy = function (destroyWidget) {
            destroyWidget.destroyRecursive();
            destroyWidget = null;
        };

        bdd.beforeEach(function () {
            widget = new WidgetUnderTest({
                filterTxt: 'Date_Discovered (Date Discovered)'
            }, domConstruct.create('div', null, document.body));
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a DateFilter', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('constructor', function () {
            bdd.it('parses the field name and alias', function () {
                expect(widget.fieldName).to.equal('Date_Discovered');
                expect(widget.fieldAlias).to.equal('Date Discovered');
            });
        });
        bdd.describe('isValid', function () {
            bdd.it('validates that both dates are present', function () {
                expect(widget.isValid()).to.equal(false);

                $(widget.from).datepicker('update', new Date());

                expect(widget.isValid()).to.equal(false);

                $(widget.to).datepicker('update', new Date());

                expect(widget.isValid()).to.equal(true);
            });
        });
        bdd.describe('getQuery', function () {
            bdd.it('returns the appropriate query string', function () {
                $(widget.from).datepicker('update', new Date('10/18/2012'));
                $(widget.to).datepicker('update', new Date('12/28/2014'));

                expect(widget.getQuery())
                    .to.equal('Date_Discovered >= date \'2012-10-18\' AND Date_Discovered <= date \'2014-12-28\'');
            });
        });
    });
});
