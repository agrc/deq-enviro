/* eslint-disable no-unused-expressions, no-magic-numbers */
define([
    'jquery',

    'app/config',
    'app/map/ScaleDependentReferenceLayerToggle',

    'dojo/dom-construct',
    'dojo/topic',
    'dojo/_base/window'
], function (
    $,

    config,
    WidgetUnderTest,

    domConstruct,
    topic,
    win
) {
    const bdd = intern.getInterface('bdd');
    const chai = intern.getPlugin('chai');
    const expect = chai.expect;

    bdd.describe('app/map/ScaleDependentReferenceLayerToggle', function () {
        var widget;
        var destroy = function (destroyWidget) {
            destroyWidget.destroyRecursive();
            destroyWidget = null;
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
