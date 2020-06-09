define([
    'app/map/MapButton',

    'dojo/dom-construct',
    'dojo/_base/window'
], function (
    WidgetUnderTest,

    domConstruct,
    win
) {
    const bdd = intern.getInterface('bdd');
    const expect = intern.getPlugin('chai').expect;

    var widget;

    bdd.describe('app/map/MapButton', function () {
        bdd.afterEach(function () {
            if (widget) {
                widget.destroy();
                widget = null;
            }
        });
        bdd.describe('Sanity', function () {
            bdd.beforeEach(function () {
                widget = new WidgetUnderTest(null, domConstruct.create('div', null, win.body()));
            });

            bdd.it('should create a MapButton', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
    });
});
