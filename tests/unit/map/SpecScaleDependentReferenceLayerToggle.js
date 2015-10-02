define([
    'jquery',
    'app/config',
    'app/map/ScaleDependentReferenceLayerToggle',

    'dojo/dom-construct',
    'dojo/topic',
    'dojo/_base/window',

    'intern!bdd',

    'intern/chai!expect'
], function (
    $,
    config,
    WidgetUnderTest,

    domConstruct,
    topic,
    win,

    bdd,

    expect
) {
    bdd.describe('app/map/ScaleDependentReferenceLayerToggle', function () {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        bdd.beforeEach(function () {
            widget = new WidgetUnderTest({
                minScaleLevel: 5
            }, domConstruct.create('div', null, win.body()));
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a ScaleDependentReferenceLayerToggle', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('disable', function () {
            bdd.it('disables if scale level is above minScaleLevel', function () {
                widget.checkbox.disabled = false;

                topic.publish(config.topics.appMapMapController.mapZoom, 10);

                expect(widget.checkbox.disabled).to.equal(false);
            });
            bdd.it('enables', function () {
                widget.checkbox.disabled = true;

                topic.publish(config.topics.appMapMapController.mapZoom, 3);

                expect(widget.checkbox.disabled).to.equal(true);
            });
        });
    });
});
