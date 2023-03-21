define([
    'app/search/QueryLayerHeader',

    'dojo/dom-construct',
    'dojo/_base/window'
], function (
    WidgetUnderTest,

    domConstruct,
    win
) {
    const bdd = intern.getInterface('bdd');
    const expect = intern.getPlugin('chai').expect;

    bdd.describe('app/search/QueryLayerHeader', function () {
        var widget;
        var destroy = function (destroyWidget) {
            destroyWidget.destroyRecursive();
            destroyWidget = null;
        };

        bdd.beforeEach(function () {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, win.body()));
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a QueryLayerHeader', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
    });
});
