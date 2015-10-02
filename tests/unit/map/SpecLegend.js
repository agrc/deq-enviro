define([
    'app/map/Legend',

    'dojo/dom-construct',

    'intern!bdd',

    'intern/chai!expect'
], function (
    WidgetUnderTest,

    domConstruct,

    bdd,

    expect
) {
    bdd.describe('app/map/Legend', function () {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
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
            bdd.it('should create a Legend', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
    });
});
