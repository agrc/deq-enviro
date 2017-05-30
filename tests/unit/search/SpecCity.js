/* eslint-disable no-unused-expressions, no-magic-numbers */
define([
    'app/map/MapController',
    'app/search/City',

    'dojo/dom-construct',
    'dojo/promise/Promise',
    'dojo/_base/window',

    'intern!bdd',

    'intern/chai!',
    'intern/chai!expect',

    'sinon',

    'sinon-chai'
], function (
    MapController,
    WidgetUnderTest,

    domConstruct,
    Promise,
    win,

    bdd,

    chai,
    expect,

    sinon,

    sinonChai
) {
    chai.use(sinonChai);
    bdd.describe('app/search/City', function () {
        sinon = sinon.sandbox.create();
        var widget;
        var destroy = function (destroyWidget) {
            destroyWidget.destroyRecursive();
            destroyWidget = null;
        };
        var map = {
            loaded: true,
            addLayer: function () {},
            on: function () {},
            removeLayer: function () {}
        };

        bdd.beforeEach(function () {
            widget = new WidgetUnderTest({
                map: map
            }, domConstruct.create('div', null, win.body()));
            widget.startup();
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
            sinon.restore();
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a City', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('getGeometry', function () {
            bdd.it('returns a promise that immediately resolves with the geometry', function () {
                widget.geometry = {};
                var p = widget.getGeometry();
                expect(p).to.be.instanceOf(Promise);

                return p.then(function (geo) {
                    expect(geo).to.equal(widget.geometry);
                });
            });
        });
        bdd.describe('clear', function () {
            bdd.it('clears text box', function () {
                widget.textBox.value = 'blah';

                widget.clear();

                expect(widget.textBox.value).to.equal('');
            });
            bdd.it('clears graphics', function () {
                sinon.spy(widget.graphicsLayer, 'clear');

                widget.clear();

                expect(widget.graphicsLayer.clear).to.have.been.called;
            });
        });
    });
});
