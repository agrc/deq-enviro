require([
    'app/search/Shape',

    'dojo/_base/window',
    'dojo/dom-construct',
    'dojo/dom-class',
    'dojo/query',
    'dojo/promise/Promise',
    'dojo/Deferred',
    'dojo/promise/all',

    'stubmodule'
], function(
    WidgetUnderTest,

    win,
    domConstruct,
    domClass,
    query,
    Promise,
    Deferred,
    all,

    stubmodule
) {
    describe('app/search/Shape', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function() {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, win.body()));
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a Shape', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('onToolBtnClick', function () {
            var btns;
            beforeEach(function () {
                btns = query('.btn-group .btn', widget.domNode);
            });
            it('activates the button and deactivates all others', function () {
                btns[0].click();

                expect(domClass.contains(btns[0], 'active')).toBe(true);

                btns[1].click();

                expect(domClass.contains(btns[0], 'active')).toBe(false);
                expect(domClass.contains(btns[1], 'active')).toBe(true);
            });
            it('activates the tool', function () {
                spyOn(widget.toolbar, 'activate');

                btns[0].click();

                expect(widget.toolbar.activate).toHaveBeenCalledWith('polygon');
            });
        });
        describe('getGeometry', function () {
            it('returns a promise', function () {
                expect(widget.getGeometry()).toEqual(jasmine.any(Promise));
            });
            it('immediately returns geometry if it\'s a polygon', function (done) {
                widget.geometry = {type: 'polygon'};

                widget.getGeometry().then(function (geo) {
                    expect(geo).toBe(widget.geometry);
                    done();
                });
            });
            it('rejects with validation message if no geometry has been defined', function (done) {
                widget.getGeometry().then(null, function (msg) {
                    expect(msg).toEqual(widget.noGeoMsg);
                    done();
                });
            });
            it('rejects with message if point/line but no buffer', function (done) {
                widget.geometry = {type: 'point'};

                var p1 = widget.getGeometry().then(null, function (msg) {
                    expect(msg).toEqual(widget.noBufferMsg);
                });

                widget.geometry = {type: 'polyline'};

                var p2 = widget.getGeometry().then(null, function (msg) {
                    expect(msg).toEqual(widget.noBufferMsg);
                });

                all([p1, p2]).then(done);
            });
            it('should buffer a point or line with buffer radius', function (done) {
                var def = new Deferred();
                var bufferSpy = jasmine.createSpy('buffer').and.returnValue(def);
                var geoMock = function () {
                    return {
                        buffer: bufferSpy,
                        on: function () {}
                    };
                };
                stubmodule('app/search/Shape', {
                    'esri/tasks/GeometryService': geoMock
                }).then(function (StubbedModule) {
                    var testWidget2 = new StubbedModule({}, domConstruct.create('div', {}, win.body()));
                    testWidget2.geometry = {type: 'point'};
                    testWidget2.bufferNum.value = '1';

                    testWidget2.getGeometry();
                    expect(bufferSpy).toHaveBeenCalled();

                    done();
                });
            });
        });
    });
});