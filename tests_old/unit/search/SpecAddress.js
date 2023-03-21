/* eslint-disable no-unused-expressions, no-magic-numbers, no-underscore-dangle */
define([
    'app/search/Address',

    'dojo/Deferred',
    'dojo/dom-construct',
    'dojo/promise/Promise',
    'dojo/_base/window'
], function (
    WidgetUnderTest,

    Deferred,
    domConstruct,
    Promise,
    win
) {
    const bdd = intern.getInterface('bdd');
    const expect = intern.getPlugin('chai').expect;

    bdd.describe('app/search/Address', function () {
        var widget;
        var destroy = function (destroyWidget) {
            destroyWidget.destroyRecursive();
            destroyWidget = null;
        };

        bdd.beforeEach(function () {
            widget = new WidgetUnderTest({
                graphicsLayer: { clear: () => {} }
            }, domConstruct.create('div', null, win.body()));
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a Address', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('getGeometry', function () {
            var def;
            bdd.beforeEach(function () {
                def = new Deferred();
            });
            bdd.it('returns a promise', function () {
                expect(widget.getGeometry()).to.be.instanceOf(Promise);
            });
            bdd.it('rejects promise if form does not contain required values', function () {
                return widget.getGeometry().then(function () {}, function () {
                    def.resolve();
                });
            });
            bdd.it('rejects if _onError is called', function () {
                widget.txtAddress.value = '1';
                widget.txtZone.value = '1';
                widget.getGeometry().then(function () {}, function () {
                    def.resolve();
                });
                widget._onError();

                return def.promise;
            });
        });
        bdd.describe('buffer', function () {
            var result = {
                location: { x: 12345,
                    y: 12345 }
            };
            bdd.it('creates a geometry service if there isn\'t one already', function () {
                var blah = { buffer: function () {} };

                widget.buffer(result);

                expect(widget.geometryService).not.to.be.null;

                widget.geometryService = blah;

                widget.buffer(result);

                expect(widget.geometryService).to.equal(blah);
            });
        });
        bdd.describe('clear', function () {
            bdd.it('clears address and zip text boxes and resets buffer to 1', function () {
                widget.txtAddress.value = 'blah';
                widget.txtZone.value = 'blah';
                widget.numBuffer.value = 99;

                widget.clear();

                expect(widget.txtAddress.value).to.equal('');
                expect(widget.txtZone.value).to.equal('');
                expect(widget.numBuffer.value).to.equal('1');
            });
        });
    });
});
