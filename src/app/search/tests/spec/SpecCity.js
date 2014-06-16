require([
    'app/search/City',
    'app/map/MapController',

    'dojo/_base/window',
    'dojo/promise/Promise',

    'dojo/dom-construct'
], function(
    WidgetUnderTest,
    MapController,

    win,
    Promise,

    domConstruct
) {
    describe('app/search/City', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var map = {
            loaded: true,
            addLayer: function () {},
            on: function () {},
            removeLayer: function () {}
        };

        beforeEach(function() {
            widget = new WidgetUnderTest({
                map: map
            }, domConstruct.create('div', null, win.body()));
            widget.startup();
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a City', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('getGeometry', function () {
            it('returns a promise that immediately resolves with the geometry', function (done) {
                widget.geometry = {};
                var p = widget.getGeometry();
                expect(p).toEqual(jasmine.any(Promise));

                p.then(function (geo) {
                    expect(geo).toBe(widget.geometry);
                    done();
                });
            });
        });
        describe('postCreate', function () {
            it('wires up onZoomed to collect the zoomed geometry', function () {
                var geo = {};
                var graphic = {geometry: geo};

                widget.onZoomed(graphic);

                expect(widget.geometry).toBe(geo);
            });
        });
        describe('clear', function () {
            it('clears text box', function () {
                widget.textBox.value = 'blah';

                widget.clear();

                expect(widget.textBox.value).toBe('');
            });
            it('clears graphics', function () {
                spyOn(widget.graphicsLayer, 'clear');

                widget.clear();

                expect(widget.graphicsLayer.clear).toHaveBeenCalled();
            });
        });
    });
});