require([
    'app/config',
    'app/map/MapController',

    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISTiledMapServiceLayer'
], function(
    config,
    ClassUnderTest,

    ArcGISDynamicMapServiceLayer,
    ArcGISTiledMapServiceLayer
) {
    describe('app/map/MapController', function() {
        var testObject;
        var map;
        var layer;
        var url = 'blah';

        beforeEach(function() {
            layer = jasmine.createSpyObj('layer', ['hide', 'show', 'setVisibleLayers']);
            layer.url = url;
            map = jasmine.createSpyObj('map', [
                'addLayer',
                'addLoaderToLayer',
                'on',
                'setExtent'
            ]);
            map.setExtent.and.returnValue({then: function () {}});
            map.on.and.returnValue({remove: function () {}});
            map.graphics = {
                add: function () {},
                clear: function () {}
            };

            testObject = ClassUnderTest;
            testObject.init({map: map});
        });

        afterEach(function() {
            if (testObject) {
                if (testObject.destroy) {
                    testObject.destroy();
                }

                testObject = null;
            }
        });

        describe('Sanity', function() {
            it('should create a MapController', function() {
                expect(testObject).toEqual(jasmine.any(Object));
            });
        });
        describe('addReferenceLayer', function () {
            it('doesn\'t add the layer to the map if it\'s already added', function () {
                map.layerIds = ['one', 'two'];
                map.getLayer = function (/* layerId */) {
                    return layer;
                };
                testObject.addReferenceLayer(url, false, null);

                expect(map.addLayer).not.toHaveBeenCalled();
            });
            it('adds the correct layer type', function () {
                testObject.addReferenceLayer('blah', false, null);

                expect(map.addLayer).toHaveBeenCalledWith(jasmine.any(ArcGISDynamicMapServiceLayer));
                expect(map.addLoaderToLayer).toHaveBeenCalled();

                testObject.addReferenceLayer('blah', true, null);

                expect(map.addLayer).toHaveBeenCalledWith(jasmine.any(ArcGISTiledMapServiceLayer));
            });
            it('can handle a layer within a map service', function () {
                testObject.addReferenceLayer('blah', false, 1);

                var lyr = map.addLayer.calls.mostRecent().args[0];

                expect(lyr.visibleLayers).toEqual([-1]);
            });
        });

        describe('toggleReferenceLayer', function () {
            beforeEach(function () {
                map.layerIds = ['one', 'two'];
                map.getLayer = function (/* layerId */) {
                    return layer;
                };
            });
            it('hides the layer', function () {
                testObject.toggleReferenceLayer(url, null, false);

                expect(layer.hide).toHaveBeenCalled();
                expect(layer.show).not.toHaveBeenCalled();
            });
            it('shows the layer', function () {
                testObject.toggleReferenceLayer(url, null, true);

                expect(layer.hide).not.toHaveBeenCalled();
                expect(layer.show).toHaveBeenCalled();
            });
            it('calls setVisibleLayers if layerIndex is passed', function () {
                layer.visibleLayers = [1, 2];

                testObject.toggleReferenceLayer(url, 0, true);

                expect(layer.setVisibleLayers).toHaveBeenCalledWith([1, 2, 0]);

                layer.visibleLayers = [1, 2, 0];
                testObject.toggleReferenceLayer(url, 0, false);

                expect(layer.setVisibleLayers.calls.mostRecent().args[0]).toEqual([1, 2]);
            });
            it('calls hide if all layers within a map service are turned off', function () {
                layer.visibleLayers = [-1, 2];

                testObject.toggleReferenceLayer(url, 2, false);

                expect(layer.hide).toHaveBeenCalled();
                expect(layer.show).not.toHaveBeenCalled();
            });
            it('calls show if any of the layers within a map service are turned on', function () {
                layer.visibleLayers = [-1];

                testObject.toggleReferenceLayer(url, 2, true);

                expect(layer.show).toHaveBeenCalled();
                expect(layer.hide).not.toHaveBeenCalled();
            });
        });
        describe('addQueryLayer', function () {
            var lyr;
            beforeEach(function () {
                lyr = {on: function () {}};
            });
            it('adds the layer to the map', function () {
                testObject.addQueryLayer(lyr, 'point');

                expect(map.addLayer).toHaveBeenCalledWith(lyr, undefined);
            });
            it('adds polygons to index position 1 and points to the top of the stack', function () {
                testObject.addQueryLayer(lyr, 'point');

                expect(map.addLayer.calls.mostRecent().args[1]).toBeUndefined();

                testObject.addQueryLayer(lyr, 'polygon');

                expect(map.addLayer.calls.mostRecent().args[1]).toBe(2);
            });
        });
        describe('zoom', function () {
            it('zooms the map to the geometry', function () {
                var value = 'blah';
                var geo = {getExtent: function () {return value;}};

                testObject.zoom(geo);

                expect(testObject.map.setExtent).toHaveBeenCalledWith(value, true);
            });
        });
        describe('graphic', function () {
            it('creates a new graphics layer on the first call', function () {
                var g = {
                    'x': 325975.0,
                    'y': 4192037.0,
                    'type': 'point',
                    'spatialReference': null
                };
                testObject.searchGraphics = null;

                testObject.graphic('test', config.symbols.zoom, g);

                expect(testObject.test).toBeDefined();
            });
        });
        describe('zoomToFeaturesFound', function () {
            beforeEach(function () {
                spyOn(testObject, 'zoom');
            });
            it('unions all of the extents and passes to zoom', function () {
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

                expect(testObject.zoom).toHaveBeenCalled();
                expect(testObject.zoom.calls.mostRecent().args[0].xmax).toEqual(6);
                expect(testObject.zoom.calls.mostRecent().args[0].ymin).toEqual(3);
            });
        });
    });
});