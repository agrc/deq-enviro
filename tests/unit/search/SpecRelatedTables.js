define([
    'app/search/RelatedTables',

    'dojo/dom-construct',

    'jquery'
], function (
    WidgetUnderTest,

    domConstruct
) {
    const bdd = intern.getInterface('bdd');
    const expect = intern.getPlugin('chai').expect;

    bdd.describe('app/search/RelatedTables', function () {
        var widget;
        var destroy = function (destroyWidget) {
            destroyWidget.destroyRecursive();
            destroyWidget = null;
        };

        bdd.beforeEach(function () {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, document.body));
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a RelatedTables', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
    });
});
