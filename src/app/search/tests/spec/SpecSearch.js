require([
    'app/search/Search',
    'app/config',

    'dojo/_base/window',

    'dojo/dom-construct',
    'dojo/topic',
    'dojo/query',

    'app/search/tests/data/mockDEQEnviroJSON'
], function(
    WidgetUnderTest,
    config,

    win,

    domConstruct,
    topic,
    query,

    mockDEQEnviroJSON
) {
    describe('app/search/Search', function() {
        var widget;

        beforeEach(function() {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, win.body()));
            widget.startup();
        });

        afterEach(function() {
            if (widget) {
                widget.destroy();
                widget = null;
            }
        });

        describe('Sanity', function() {
            it('should create a Search', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('listenForQueryLayers', function () {
            var one = {};
            var two = {};

            it('add query layers to selectedQueryLayers array', function () {
                topic.publish(config.topics.appQueryLayer.addLayer, one);
                topic.publish(config.topics.appQueryLayer.addLayer, two);

                expect(widget.selectedQueryLayers).toEqual([one, two]);
            });
            it('removes query layers', function () {
                widget.selectedQueryLayers = [one, two];

                topic.publish(config.topics.appQueryLayer.removeLayer, one);

                expect(widget.selectedQueryLayers).toEqual([two]);
            });
        });
        describe('buildQueryLayers', function () {
            it('builds the correct number of query layers and headers', function () {
                widget.buildQueryLayers(mockDEQEnviroJSON.queryLayers);

                expect(query('.query-layer', widget.domNode).length).toBe(5);
                expect(query('.query-layer-header', widget.domNode).length).toBe(3);
            });
        });
        describe('onSelectChange', function () {
            it('clears the zoomedGeometry', function () {
                widget.zoomedGeometry = {};

                widget.onSelectChange();

                expect(widget.zoomedGeometry).toBeNull();
            });
        });
    });
});