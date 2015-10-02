define([
    'agrc/widgets/map/BaseMap',

    'app/map/MapButton',
    'app/map/MeasureTool',

    'dojo/Deferred',
    'dojo/dom-construct',

    'intern!bdd',

    'intern/chai!expect'
], function (
    BaseMap,

    MapButton,
    WidgetUnderTest,

    Deferred,
    domConstruct,

    bdd,

    expect
) {
    bdd.describe('app/map/MeasureTool', function () {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var btn;

        bdd.beforeEach(function () {
            var def = new Deferred();
            btn = new MapButton(null, domConstruct.create('div', null, document.body));
            var map = new BaseMap(domConstruct.create('div'));
            map.on('load', function () {
                widget = new WidgetUnderTest({
                    popoverBtn: btn.domNode,
                    map: map
                }, domConstruct.create('div', null, document.body));
                def.resolve();
            });
            return def.promise
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
