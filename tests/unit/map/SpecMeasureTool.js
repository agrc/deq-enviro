/* eslint-disable no-unused-expressions, no-magic-numbers */
define([
    'agrc/widgets/map/BaseMap',

    'app/map/MapButton',
    'app/map/MeasureTool',

    'dojo/Deferred',
    'dojo/dom-construct',

    'esri/SpatialReference',

    'intern!bdd',

    'intern/chai!expect'
], function (
    BaseMap,

    MapButton,
    WidgetUnderTest,

    Deferred,
    domConstruct,

    SpatialReference,

    bdd,

    expect
) {
    bdd.describe('app/map/MeasureTool', function () {
        var widget;
        var destroy = function (destroyWidget) {
            destroyWidget.destroyRecursive();
            destroyWidget = null;
        };
        var btn;

        bdd.beforeEach(function () {
            btn = new MapButton(null, domConstruct.create('div', null, document.body));
            var map = new BaseMap(domConstruct.create('div'), {
                useDefaultBaseMap: false
            });
            map.spatialReference = new SpatialReference(3857);
            map.graphics = { remove: function () {} };
            widget = new WidgetUnderTest({
                popoverBtn: btn.domNode,
                map: map
            }, domConstruct.create('div', null, document.body));
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a MeasureTool', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
    });
});
