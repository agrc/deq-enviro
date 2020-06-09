/* eslint-disable no-unused-expressions, no-magic-numbers */
define([
    'jquery',

    'agrc/widgets/map/BaseMap',

    'app/map/MapButton',
    'app/map/Print',

    'dojo/Deferred',
    'dojo/dom-class',
    'dojo/dom-construct'
], function (
    $,

    BaseMap,

    MapButton,
    WidgetUnderTest,

    Deferred,
    domClass,
    domConstruct
) {
    const bdd = intern.getInterface('bdd');
    const expect = intern.getPlugin('chai').expect;

    bdd.describe('app/map/Print', function () {
        var widget;
        var destroy = function (destroyWidget) {
            destroyWidget.destroyRecursive();
            destroyWidget = null;
        };

        bdd.beforeEach(function () {
            var btn = new MapButton(null, domConstruct.create('div', null, document.body));
            var map = new BaseMap(domConstruct.create('div'), {
                useDefaultBaseMap: false
            });
            widget = new WidgetUnderTest({
                map: map,
                popoverBtn: btn.domNode
            }, domConstruct.create('div', null, document.body));
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a Print', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('showLoader', function () {
            bdd.it('disables print button and sets text', function () {
                var value = 'blah';

                widget.showLoader(value);

                expect(widget.printBtn.innerHTML).to.equal(value);
                expect(widget.printBtn.disabled).to.equal(true);
            });
        });
        bdd.describe('hideLoader', function () {
            bdd.it('enables button and resets text', function () {
                widget.printBtn.disabled = true;
                widget.printBtn.innerHTML = 'blah';

                widget.hideLoader();

                expect(widget.printBtn.disabled).to.equal(false);
                expect(widget.printBtn.innerHTML).to.equal(widget.btnText);
            });
        });
    });
});
