require([
    'app/map/MeasureTool',
    'app/map/MapButton',

    'agrc/widgets/map/BaseMap',

    'dojo/dom-construct'
], function(
    WidgetUnderTest,
    MapButton,

    BaseMap,

    domConstruct
) {
    describe('app/map/MeasureTool', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var btn;

        beforeEach(function(done) {
            btn = new MapButton();
            var map = new BaseMap(domConstruct.create('div'));
            map.on('load', function () {
                widget = new WidgetUnderTest({
                    btn: btn.domNode,
                    map: map
                }, domConstruct.create('div', null, document.body));

                done();
            });
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a MeasureTool', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
    });
});
