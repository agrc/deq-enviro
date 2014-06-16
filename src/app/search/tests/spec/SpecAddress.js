/* jshint camelcase:false */
require([
    'app/search/Address',

    'dojo/_base/window',

    'dojo/dom-construct',
    'dojo/promise/Promise'
], function(
    WidgetUnderTest,

    win,

    domConstruct,
    Promise
) {
    describe('app/search/Address', function() {
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
            it('should create a Address', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('getGeometry', function () {
            it('returns a promise', function () {
                expect(widget.getGeometry()).toEqual(jasmine.any(Promise));
            });
            it('rejects promise if form does not contain required values', function (done) {
                widget.getGeometry().then(function () {}, function () {
                    done();
                });
            });
            it('rejects if _onError is called', function (done) {
                widget.txtAddress.value = '1';
                widget.txtZone.value = '1';
                widget.getGeometry().then(function () {}, function () {
                    done();
                });
                widget._onError();
            });
        });
        describe('buffer', function () {
            var result = {
                location: {x: 12345, y: 12345}
            };
            it('creates a geometry service if there isn\'t one already', function () {
                var blah = {buffer: function () {}};

                widget.buffer(result);

                expect(widget.geometryService).not.toBeNull();

                widget.geometryService = blah;

                widget.buffer(result);

                expect(widget.geometryService).toEqual(blah);
            });
        });
        describe('clear', function () {
            it('clears address and zip text boxes and resets buffer to 1', function () {
                widget.txtAddress.value = 'blah';
                widget.txtZone.value = 'blah';
                widget.numBuffer.value = 99;

                widget.clear();

                expect(widget.txtAddress.value).toBe('');
                expect(widget.txtZone.value).toBe('');
                expect(widget.numBuffer.value).toBe('1');
            });
        });
    });
});