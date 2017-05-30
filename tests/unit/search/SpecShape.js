/* eslint-disable no-unused-expressions */
define([
    'app/config',
    'app/search/Shape',
    'app/map/MapController',

    'dojo/Deferred',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/promise/all',
    'dojo/promise/Promise',
    'dojo/query',
    'dojo/_base/window',

    'intern!bdd',

    'intern/chai!',
    'intern/chai!expect',

    'tests/helpers/topics',

    'sinon',

    'sinon-chai'
], function (
    config,
    WidgetUnderTest,
    mapController,

    Deferred,
    domClass,
    domConstruct,
    all,
    Promise,
    query,
    win,

    bdd,

    chai,
    expect,

    topics,

    sinon,

    sinonChai
) {
    chai.use(sinonChai);
    chai.use(topics.plugin);
    bdd.describe('app/search/Shape', function () {
        sinon = sinon.sandbox.create();
        var widget;
        var destroy = function (destroyWidget) {
            destroyWidget.destroyRecursive();
            destroyWidget = null;
        };
        var btns;

        bdd.beforeEach(function () {
            topics.beforeEach();
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, win.body()));
            sinon.stub(widget.toolbar, 'activate');
            btns = query('.btn-group .btn', widget.domNode);
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
            sinon.restore();
            topics.afterEach();
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a Shape', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('onToolBtnClick', function () {
            bdd.it('activates the button and deactivates all others', function () {
                btns[0].click();

                expect(domClass.contains(btns[0], 'active')).to.equal(true);

                btns[1].click();

                expect(domClass.contains(btns[0], 'active')).to.equal(false);
                expect(domClass.contains(btns[1], 'active')).to.equal(true);
            });
            bdd.it('activates the tool', function () {
                btns[0].click();

                expect(widget.toolbar.activate).to.have.been.calledWith('polygon');
            });
            bdd.it('clears any existing graphics', function () {
                topics.listen(config.topics.appMapMapController.clearGraphics);

                btns[0].click();

                expect(config.topics.appMapMapController.clearGraphics).to.have.been.published();
            });
        });
        bdd.describe('getGeometry', function () {
            bdd.beforeEach(function () {
                sinon.stub(widget.toolbar, 'deactivate');
            });
            bdd.it('returns a promise', function () {
                expect(widget.getGeometry()).to.be.instanceOf(Promise);
            });
            bdd.it('immediately returns geometry if it\'s a polygon', function () {
                widget.geometry = { type: 'polygon' };

                return widget.getGeometry().then(function (geo) {
                    expect(geo).to.equal(widget.geometry);
                });
            });
            bdd.it('rejects with validation message if no geometry has been defined', function () {
                return widget.getGeometry().then(null, function (msg) {
                    expect(msg).to.equal(widget.noGeoMsg);
                });
            });
            bdd.it('rejects with message if point/line but no buffer', function () {
                widget.geometry = { type: 'point' };

                var p1 = widget.getGeometry().then(null, function (msg) {
                    expect(msg).to.equal(widget.noBufferMsg);
                });

                widget.geometry = { type: 'polyline' };

                var p2 = widget.getGeometry().then(null, function (msg) {
                    expect(msg).to.equal(widget.noBufferMsg);
                });

                return all([p1, p2]);
            });
            bdd.it('should buffer a point or line with buffer radius', function () {
                var def = new Deferred();
                var bufferSpy = sinon.stub().returns(def);
                var geoMock = {
                    buffer: bufferSpy,
                    on: function () {}
                };

                widget.initGeoService();
                widget.geoService = geoMock;
                widget.geometry = { type: 'point' };
                widget.bufferNum.value = '1';

                widget.getGeometry();
                expect(bufferSpy).to.have.been.called;

                destroy(widget);
            });
            bdd.it('gets selected feature if no geometry is defined', function () {
                var def = new Deferred();
                var bufferSpy = sinon.stub().returns(def);
                var geoMock = {
                    buffer: bufferSpy,
                    on: function () {}
                };

                var g = {};
                var graphic = {
                    geometry: g
                };
                mapController.selectedGraphic = graphic;

                widget.initGeoService();
                widget.geoService = geoMock;
                widget.bufferNum.value = '1';

                widget.getGeometry();
                expect(bufferSpy.args[0][0].geometries[0]).to.equal(g);

                destroy(widget);
            });
        });
        bdd.describe('clear', function () {
            bdd.beforeEach(function () {
                sinon.stub(widget.toolbar, 'deactivate');
            });
            bdd.it('clears any existing graphics', function () {
                topics.listen(config.topics.appMapMapController.clearGraphics);

                widget.clear();

                expect(config.topics.appMapMapController.clearGraphics).to.have.been.published();
            });
            bdd.it('disabled the tool', function () {
                widget.clear();

                expect(widget.toolbar.deactivate).to.have.been.called;
            });
            bdd.it('deactivates all buttons', function () {
                btns[0].click();

                widget.clear();

                expect(domClass.contains(btns[0], 'active')).to.equal(false);
            });
            bdd.it('resets buffer to 0', function () {
                widget.bufferNum.value = 5;

                widget.clear();

                expect(widget.bufferNum.value).to.equal('');
            });
        });
    });
});
