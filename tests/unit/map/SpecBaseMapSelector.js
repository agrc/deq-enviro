define([
    'app/map/BaseMapSelector',

    'dojo/dom-construct',
    'dojo/_base/window',

    'intern!bdd',

    'intern/chai!expect'
], function (
    WidgetUnderTest,

    domConstruct,
    win,

    bdd,

    expect
) {
    bdd.describe('app/map/BaseMapSelector', function () {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        bdd.beforeEach(function () {
            widget = new WidgetUnderTest({
                map: {
                    layerIds: [],
                    addLayer: function () {},
                    removeLayer: function () {}
                }
            }, domConstruct.create('div', null, win.body()));
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a BaseMapSelector', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
    });
});
