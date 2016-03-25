define([
    'app/config',
    'app/map/MapController',

    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISTiledMapServiceLayer',

    'intern!bdd',

    'intern/chai!',
    'intern/chai!expect',

    'sinon',

    'sinon-chai'
], function (
    config,
    ClassUnderTest,

    ArcGISDynamicMapServiceLayer,
    ArcGISTiledMapServiceLayer,

    bdd,

    chai,
    expect,

    sinon,

    sinonChai
) {
    chai.use(sinonChai);
    bdd.describe('app/map/MapController', function () {
        sinon = sinon.sandbox.create();
        var testObject;
        var map;
        var layer;
        var url = 'blah';

        bdd.beforeEach(function () {
            layer = {
                hide: sinon.stub(),
                show: sinon.stub(),
                setVisibleLayers: sinon.stub()
            };
            layer.url = url;
            map = {
                addLayer: sinon.stub(),
                addLoaderToLayer: sinon.stub(),
                on: sinon.stub(),
                setExtent: sinon.stub()
            };
            map.setExtent.returns({then: function () {}});
            map.on.returns({remove: function () {}});
            map.graphics = {
                add: function () {},
                clear: function () {}
            };

            testObject = ClassUnderTest;
            testObject.init({map: map});
        });

        bdd.afterEach(function () {
            if (testObject) {
                if (testObject.destroy) {
                    testObject.destroy();
                }

                testObject = null;
            }
            sinon.restore();
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a MapController', function () {
                expect(testObject).to.be.instanceOf(Object);
            });
        });
        bdd.describe('addReferenceLayer', function () {
            bdd.it('adds the correct layer type', function () {
                testObject.addReferenceLayer('blah', ArcGISDynamicMapServiceLayer, null);

                expect(map.addLayer.lastCall.args[0]).to.be.instanceOf(ArcGISDynamicMapServiceLayer);
                expect(map.addLoaderToLayer).to.have.been.called;

                testObject.addReferenceLayer('blah', ArcGISTiledMapServiceLayer, null);

                expect(map.addLayer.lastCall.args[0]).to.be.instanceOf(ArcGISTiledMapServiceLayer);
            });
            bdd.it('can handle a layer within a map service', function () {
                testObject.addReferenceLayer('blah', ArcGISDynamicMapServiceLayer, 1);

                var lyr = map.addLayer.lastCall.args[0];

                expect(lyr.visibleLayers).to.deep.equal([-1]);
            });
        });

        bdd.describe('toggleReferenceLayer', function () {
            bdd.beforeEach(function () {
                map.layerIds = ['one', 'two'];
                map.getLayer = function (/* layerId */) {
                    return layer;
                };
            });
            bdd.it('hides the layer', function () {
                testObject.toggleReferenceLayer(url, null, false);

                expect(layer.hide).to.have.been.called;
                expect(layer.show).not.to.have.been.called;
            });
            bdd.it('shows the layer', function () {
                testObject.toggleReferenceLayer(url, null, true);

                expect(layer.hide).not.to.have.been.called;
                expect(layer.show).to.have.been.called;
            });
            bdd.it('calls setVisibleLayers if layerIndex is passed', function () {
                layer.visibleLayers = [1, 2];

                testObject.toggleReferenceLayer(url, 0, true);

                expect(layer.setVisibleLayers).to.have.been.calledWith([1, 2, 0]);

                layer.visibleLayers = [1, 2, 0];
                testObject.toggleReferenceLayer(url, 0, false);

                expect(layer.setVisibleLayers.lastCall.args[0]).to.deep.equal([1, 2]);
            });
            bdd.it('calls hide if all layers within a map service are turned off', function () {
                layer.visibleLayers = [-1, 2];

                testObject.toggleReferenceLayer(url, 2, false);

                expect(layer.hide).to.have.been.called;
                expect(layer.show).not.to.have.been.called;
            });
            bdd.it('calls show if any of the layers within a map service are turned on', function () {
                layer.visibleLayers = [-1];

                testObject.toggleReferenceLayer(url, 2, true);

                expect(layer.show).to.have.been.called;
                expect(layer.hide).not.to.have.been.called;
            });
        });
        bdd.describe('addQueryLayer', function () {
            var lyr;
            bdd.beforeEach(function () {
                lyr = {on: function () {}};
            });
            bdd.it('adds the layer to the map', function () {
                testObject.addQueryLayer(lyr, 'point');

                expect(map.addLayer).to.have.been.calledWith(lyr, undefined);
            });
            bdd.it('adds polygons to index position 1 and points to the top of the stack', function () {
                testObject.addQueryLayer(lyr, 'point');

                expect(map.addLayer.lastCall.args[1]).to.not.exist;

                testObject.addQueryLayer(lyr, 'polygon');

                expect(map.addLayer.lastCall.args[1]).to.equal(2);
            });
        });
        bdd.describe('zoom', function () {
            bdd.it('zooms the map to the geometry', function () {
                var value = 'blah';
                var geo = {getExtent: function () {
                    return value;
                }};

                testObject.zoom(geo);

                expect(testObject.map.setExtent).to.have.been.calledWith(value, true);
            });
        });
        bdd.describe('graphic', function () {
            var x = 325975.0;
            var g = {
                'x': x,
                'y': 4192037.0,
                'type': 'point',
                'spatialReference': null
            };
            bdd.it('creates a new graphics layer on the first call', function () {
                testObject.graphic('test', config.symbols.zoom, g);

                expect(testObject.test).to.exist;
            });
            bdd.it('stores the selected feature for future use', function () {
                testObject.selectedGraphic = null;

                testObject.graphic('test2', config.symbols.zoom, g);

                expect(testObject.selectedGraphic).not.to.be.null;
            });
        });
        bdd.describe('zoomToFeaturesFound', function () {
            bdd.beforeEach(function () {
                sinon.spy(testObject, 'zoom');
            });
            bdd.it('unions all of the extents and passes to zoom', function () {
                var testResponse = {
                    34: {
                        extent: {
                            xmax: 5,
                            xmin: 3,
                            ymax: 5,
                            ymin: 3
                        },
                        features: [1,2]
                    },
                    s1: {
                        extent: {
                            xmax: 6,
                            xmin: 4,
                            ymax: 6,
                            ymin: 4
                        },
                        features: [3,4]
                    }
                };
                testObject.zoomToFeaturesFound(testResponse);

                expect(testObject.zoom).to.have.been.called;
                expect(testObject.zoom.lastCall.args[0].xmax).to.equal(6);
                expect(testObject.zoom.lastCall.args[0].ymin).to.equal(3);
            });
        });
    });
});
