define([
    'app/search/CheckboxFilter',

    'dojo/dom-construct'
], function (
    WidgetUnderTest,

    domConstruct
) {
    const bdd = intern.getInterface('bdd');
    const expect = intern.getPlugin('chai').expect;

    bdd.describe('app/search/CheckboxFilter', function () {
        var widget;
        var destroy = function (destroyWidget) {
            destroyWidget.destroyRecursive();
            destroyWidget = null;
        };

        bdd.beforeEach(function () {
            widget = new WidgetUnderTest({
                filterTxt: 'TANK = 0 (Tank Status: Closed), TANK = 1 (Tank Status: Open)'
            }, domConstruct.create('div', null, document.body));
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a CheckboxFilter', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
    });
});
