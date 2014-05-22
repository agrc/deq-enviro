require([
    'app/search/Search',
    'app/config',
    'app/search/QueryLayer',

    'dojo/_base/window',

    'dojo/dom-construct',
    'dojo/topic',
    'dojo/query',
    'dojo/Deferred',

    'app/search/tests/data/mockDEQEnviroJSON',

    'stubmodule'
], function(
    WidgetUnderTest,
    config,
    QueryLayer,

    win,

    domConstruct,
    topic,
    query,
    Deferred,

    mockDEQEnviroJSON,

    stubmodule
) {
    describe('app/search/Search', function() {
        var widget;
        var Module;

        beforeEach(function(done) {
            stubmodule('app/search/Search', {
                'app/search/City': function () {return {startup: function () {}};}
            }).then(function (StubbedModule) {
                Module = StubbedModule;
                widget = new StubbedModule({}, domConstruct.create('div', {}, win.body()));
                widget.startup();
                done();
            });
        });
        afterEach(function() {
            if (widget) {
                widget.destroy();
                widget = null;
            }
        });
        describe('Sanity', function() {
            it('should create a Search', function() {
                expect(widget).toEqual(jasmine.any(Module));
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
        describe('search', function () {
            var geomSearch;
            var textSearch;
            var def;
            beforeEach(function () {
                def = new Deferred();
                geomSearch = {
                    getGeometry: jasmine.createSpy('getGeometry').and.returnValue(def.promise)
                };
                textSearch = {
                    getSearchParam: jasmine.createSpy('getSearchParam')
                };
            });
            it('calls getGeometry', function () {
                widget.currentPane = geomSearch;

                widget.search();

                expect(geomSearch.getGeometry).toHaveBeenCalled();
            });
            it('calls getSearchParam', function () {
                widget.currentPane = textSearch;

                widget.search();

                expect(textSearch.getSearchParam).toHaveBeenCalled();
            });
            it('displays error messages from getGeometry rejects', function () {
                var value = 'blah';
                widget.currentPane = geomSearch;

                widget.search();

                def.reject(value);

                expect(widget.errMsg.innerHTML).toBe(value);
            });
            it('displays error messages from getSearchParam errors', function () {
                var value = 'blah';
                textSearch.getSearchParam.and.callFake(function () {
                    throw value;
                });
                widget.currentPane = textSearch;

                widget.search();

                expect(widget.errMsg.innerHTML).toBe(value);
            });
        });
        describe('getQueryLayersParam', function () {
            it('formats the data for each query layer appropriately', function () {
                widget.selectedQueryLayers = [
                    new QueryLayer({index: 1, defQuery: '01'}),
                    new QueryLayer({index: 2, defQuery: '02'})
                ];

                expect(widget.getQueryLayersParam()).toEqual([
                    {id: 1, defQuery: '01'},
                    {id: 2, defQuery: '02'}
                ]);
            });
        });
    });
});