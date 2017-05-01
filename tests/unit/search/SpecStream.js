define([
    'app/config',
    'app/map/MapController',
    'app/search/Stream',

    'dojo/dom-construct',
    'dojo/promise/Promise',

    'esri/map',

    'intern!bdd',

    'intern/chai!',
    'intern/chai!expect',

    'sinon',

    'sinon-chai'
], function (
    config,
    MapController,
    Stream,

    domConstruct,
    Promise,

    Map,

    bdd,

    chai,
    expect,

    sinon,

    sinonChai
) {
    chai.use(sinonChai);
    bdd.describe('app/search/Stream', () => {
        sinon = sinon.sandbox.create();

        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        bdd.beforeEach(() => {
            MapController.map = new Map(domConstruct.create('div', null, document.body), { basemap: 'streets' });
            MapController.selectedGraphic = null;
            widget = new Stream(null, domConstruct.create('div', null, document.body));
        });

        bdd.afterEach(() => {
            if (widget) {
                destroy(widget);
            }
            if (MapController.map) {
                MapController.map.destroy();
            }
        });

        bdd.describe('Sanity', () => {
            bdd.it('should create a Shape', () => {
                expect(widget).to.be.instanceOf(Stream);
            });
        });

        bdd.describe('getGeometry', () => {
            bdd.it('returns a promise', () => {
                expect(widget.getGeometry()).to.be.instanceOf(Promise);
            });
            bdd.it('returns no geometry message', () => {
                return widget.getGeometry().then(null, (msg) => {
                    expect(msg).to.equal(widget.noGeoMsg);
                });
            });
            bdd.it('returns no buffer message', () => {
                widget.geometry = {};
                widget.bufferNum.value = config.minBufferMsg - 0.01;
                return widget.getGeometry().then(null, (msg) => {
                    expect(msg).to.equal(widget.noBufferMsg);
                });
            });
        });

        bdd.describe('clear', () => {
            bdd.it('clears graphics and sherlock text box', () => {
                widget.sherlock.textBox.value = 'blah';
                sinon.stub(widget.graphicsLayer, 'clear');

                widget.clear();

                expect(widget.sherlock.textBox.value).to.equal('');
                expect(widget.graphicsLayer.clear).to.have.been.called;
            });
        });
    });
});
