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

    'stubmodule',

    'matchers/topics'
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

    stubmodule,

    topics
) {
    describe('app/search/Search', function() {
        var widget;
        var Module;

        beforeEach(function(done) {
            stubmodule('app/search/Search', {
                'app/search/City': function () {return {startup: function () {}, destroy: function () {}};},
                'app/map/MapController': {map: {graphics: {}}}
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
            it('calls clear on the previous pane', function () {
                var previousPane = jasmine.createSpy('previousPane');
                var value = 'blah';
                widget.currentPane = {clear: previousPane};
                widget.select.value = 'blah';
                widget[value] = {};
                spyOn(widget.stackContainer, 'selectChild');

                widget.onSelectChange();

                expect(previousPane).toHaveBeenCalled();
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
            it('displays error message from getQueryLayersParam', function () {
                widget.currentPane = geomSearch;

                widget.search();

                def.resolve();

                expect(widget.errMsg.innerHTML).toBe(widget.noQueryLayersSelectedErrMsg);
            });
            it('displays error message if no search type is selected', function () {
                widget.search();

                expect(widget.errMsg.innerHTML).toBe(widget.noSearchTypeSelectedErrMsg);
            });
        });
        describe('getQueryLayersParam', function () {
            it('formats the data for each query layer appropriately', function () {
                widget.selectedQueryLayers = [
                    new QueryLayer({index: '1', defQuery: '01', secure: 'No'}),
                    new QueryLayer({index: '2', defQuery: '02', secure: 'No'}),
                    new QueryLayer({index: 's4', deqQuery: null, secure: 'Yes'})
                ];

                expect(widget.getQueryLayersParam()).toEqual({
                    queryLayers: [
                        {id: '1', defQuery: '01'},
                        {id: '2', defQuery: '02'}
                    ],
                    secureQueryLayers: [
                        {id: '4', defQuery: null}
                    ]
                });
            });
            it('throws an error if no query layers are selected', function () {
                expect(function () {
                    widget.getQueryLayersParam();
                }).toThrow(widget.noQueryLayersSelectedErrMsg);
            });
            it('does not define queryLayers or secureQueryLayers if no features', function () {
                widget.selectedQueryLayers = [
                    new QueryLayer({index: '1', defQuery: '01', secure: 'No'}),
                    new QueryLayer({index: '2', defQuery: '02', secure: 'No'})
                ];

                expect(widget.getQueryLayersParam()).toEqual({
                    queryLayers: [
                        {id: '1', defQuery: '01'},
                        {id: '2', defQuery: '02'}
                    ],
                    secureQueryLayers: null
                });

                widget.selectedQueryLayers = [
                    new QueryLayer({index: 's4', deqQuery: null, secure: 'Yes'})
                ];

                expect(widget.getQueryLayersParam()).toEqual({
                    queryLayers: null,
                    secureQueryLayers: [
                        {id: '4', defQuery: null}
                    ]
                });
            });
        });
        describe('clear', function () {
            it('calls clear on the current search pane', function () {
                var clearSpy = jasmine.createSpy();
                widget.currentPane = {clear: clearSpy};

                widget.clear();

                expect(clearSpy).toHaveBeenCalled();
            });
            it('fires the clear topic', function () {
                topics.listen(config.topics.appSearch.clear);

                widget.clear();

                expect(config.topics.appSearch.clear).toHaveBeenPublished();
            });
        });
    });
});