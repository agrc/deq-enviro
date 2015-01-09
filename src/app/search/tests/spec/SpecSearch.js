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
                spyOn(widget.stackContainer, 'selectChild');
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
        describe('onAddQueryLayer', function () {
            it('inits additional searches on the query layer if they are existing and this is the only ' +
                'selected query layer', function () {
                var obj = {
                    fieldName: 'FieldName',
                    fieldAlias: 'Field Alias',
                    fieldType: 'text'
                };
                var ql = {
                    additionalSearchObjects: [obj, {
                        fieldName: 'FieldName',
                        fieldAlias: 'Field Alias',
                        fieldType: 'text'
                    }]
                };
                spyOn(widget, 'addAdditionalSearch');

                widget.selectedQueryLayers = [{}, {}];

                widget.onAddQueryLayer(ql);

                expect(widget.addAdditionalSearch).not.toHaveBeenCalled();

                widget.selectedQueryLayers = [];

                widget.onAddQueryLayer(ql);

                expect(widget.addAdditionalSearch.calls.mostRecent().args[0]).toEqual(obj);
                expect(widget.addAdditionalSearch.calls.count()).toBe(2);
            });
        });
        describe('addAdditionalSearch', function () {
            var obj = {
                fieldName: 'FieldName',
                fieldAlias: 'Field Alias',
                fieldType: 'text'
            };
            it('adds a new item to the select', function () {
                widget.addAdditionalSearch(obj);

                var lastOption = widget.select.children[widget.select.children.length - 1];
                expect(lastOption.innerHTML).toBe(obj.fieldAlias);
                expect(lastOption.value).toBe(obj.fieldName);
            });
            it('adds the new widget to additionalSearches', function () {
                widget.addAdditionalSearch(obj);

                expect(widget.additionalSearches.length).toBe(1);
            });
        });
        describe('removeAdditionalSearches', function () {
            var obj = {
                fieldName: 'FieldName',
                fieldAlias: 'Field Alias',
                fieldType: 'text'
            };
            var obj2 = {
                fieldName: 'FieldName2',
                fieldAlias: 'Field Alias',
                fieldType: 'text'
            };
            it('removes item from select and stack container', function () {
                expect(widget.select.children.length).toBe(7);

                widget.addAdditionalSearch(obj);
                widget.addAdditionalSearch(obj2);

                expect(widget.select.children.length).toBe(9);

                var as = widget.additionalSearches[0];
                spyOn(as, 'destroy');
                spyOn(widget.stackContainer, 'removeChild');

                widget.removeAdditionalSearches();

                expect(widget.select.children.length).toBe(7);
                expect(as.destroy).toHaveBeenCalled();
                expect(widget.stackContainer.removeChild).toHaveBeenCalledWith(as);
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
            beforeEach(function () {
                config.user = {token: ''};
            });
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
        describe('checkSiteIDSearches', function () {
            it('hides search if not in all selected layers', function () {
                var fn = config.fieldNames.queryLayers;
                var ql = {};
                ql[fn.ID] = 'blah';
                ql[fn.NAME] = 'blah';
                widget.onAddQueryLayer(ql);

                expect(query('option:not(.hidden)', widget.select).length).toBe(7);

                var ql2 = {};
                ql2[fn.ID] = 'blah';
                ql2[fn.NAME] = 'n/a';
                widget.onAddQueryLayer(ql2);

                expect(query('option:not(.hidden)', widget.select).length).toBe(6);

                var ql3 = {};
                ql3[fn.ID] = 'n/a';
                ql3[fn.NAME] = 'n/a';
                widget.onAddQueryLayer(ql3);

                var ql4= {};
                ql4[fn.ID] = 'blah';
                ql4[fn.NAME] = 'blah';
                widget.onAddQueryLayer(ql4);

                expect(query('option:not(.hidden)', widget.select).length).toBe(5);

                widget.onRemoveQueryLayer(ql3);
                widget.onRemoveQueryLayer(ql2);

                expect(query('option:not(.hidden)', widget.select).length).toBe(7);
            });
            it('sets back to empty if current pane is hidden', function () {
                var fn = config.fieldNames.queryLayers;
                var ql = {};
                ql[fn.ID] = 'blah';
                ql[fn.NAME] = 'blah';
                widget.onAddQueryLayer(ql);

                widget.select.value = 'id';
                widget.onSelectChange();
                
                var ql3 = {};
                ql3[fn.ID] = 'n/a';
                ql3[fn.NAME] = 'n/a';
                widget.onAddQueryLayer(ql3);

                expect(widget.select.value).toBe('empty');
            });
        });
        describe('checkForMaxRecords', function () {
            it('throw an error if no max records messages', function () {
                expect(function () {
                    widget.checkForMaxRecords({});
                }).toThrow();

                expect(function () {
                    widget.checkForMaxRecords({
                        queryLayers: {message: 'blah'}
                    });
                }).toThrow();
            });
            it('extracts the layer id', function () {
                spyOn(config, 'getQueryLayerByIndex').and.returnValue({
                    name: 'blah',
                    metaDataUrl: 'blah'
                });
                expect(widget.checkForMaxRecords({
                    secureQueryLayers: {
                        message: 'Max records exceeded on PointsOfDiversion1. (33)'
                    }
                })).toBeDefined();
            });
        });
    });
});