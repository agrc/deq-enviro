define([
    'app/config',
    'app/search/QueryLayer',
    'app/search/Search',
    'tests/unit/search/data/mockDEQEnviroJSON',

    'dojo/Deferred',
    'dojo/dom-construct',
    'dojo/query',
    'dojo/topic',
    'dojo/_base/window',

    'intern!bdd',

    'intern/chai!',
    'intern/chai!expect',

    'tests/helpers/topics',

    'sinon',

    'sinon-chai',

    'stubmodule'
], function (
    config,
    QueryLayer,
    WidgetUnderTest,
    mockDEQEnviroJSON,

    Deferred,
    domConstruct,
    query,
    topic,
    win,

    bdd,

    chai,
    expect,

    topics,

    sinon,

    sinonChai,

    stubmodule
) {
    chai.use(sinonChai);
    chai.use(topics.plugin);
    bdd.describe('app/search/Search', function () {
        sinon = sinon.sandbox.create();
        var widget;
        var Module;

        bdd.beforeEach(function () {
            topics.beforeEach();
            return stubmodule('app/search/Search', {
                'app/search/City': function () {
                    return {
                        startup: function () {},
                        destroy: function () {}
                    };
                },
                'app/map/MapController': {map: {graphics: {}}}
            }).then(function (StubbedModule) {
                Module = StubbedModule;
                widget = new StubbedModule({
                    app: {
                        currentAnimationPromise: {
                            then: function (cb) {
                                cb();
                            }
                        }
                    }
                }, domConstruct.create('div', {}, win.body()));
                widget.startup();
                sinon.stub(widget.stackContainer, 'selectChild');
            });
        });
        bdd.afterEach(function () {
            if (widget) {
                widget.destroy();
                widget = null;
            }
            sinon.restore();
            topics.afterEach();
        });
        bdd.describe('Sanity', function () {
            bdd.it('should create a Search', function () {
                expect(widget).to.be.instanceOf(Module);
            });
        });
        bdd.describe('listenForQueryLayers', function () {
            var one = {};
            var two = {};

            bdd.it('add query layers to selectedQueryLayers array', function () {
                topic.publish(config.topics.appQueryLayer.addLayer, one);
                topic.publish(config.topics.appQueryLayer.addLayer, two);

                expect(widget.selectedQueryLayers).to.deep.equal([one, two]);
            });
            bdd.it('removes query layers', function () {
                widget.selectedQueryLayers = [one, two];

                topic.publish(config.topics.appQueryLayer.removeLayer, one);

                expect(widget.selectedQueryLayers).to.deep.equal([two]);
            });
        });
        bdd.describe('onAddQueryLayer', function () {
            bdd.it('inits additional searches on the query layer if they are existing and this is the only ' +
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
                sinon.spy(widget, 'addAdditionalSearch');

                widget.selectedQueryLayers = [{}, {}];

                widget.onAddQueryLayer(ql);

                expect(widget.addAdditionalSearch).not.to.have.been.called;

                widget.selectedQueryLayers = [];

                widget.onAddQueryLayer(ql);

                expect(widget.addAdditionalSearch.lastCall.args[0]).to.deep.equal(obj);
                expect(widget.addAdditionalSearch).to.have.been.calledTwice;
            });
        });
        bdd.describe('addAdditionalSearch', function () {
            var obj = {
                fieldName: 'FieldName',
                fieldAlias: 'Field Alias',
                fieldType: 'text'
            };
            bdd.it('adds a new item to the select', function () {
                widget.addAdditionalSearch(obj);

                var lastOption = widget.select.children[widget.select.children.length - 1];
                expect(lastOption.innerHTML).to.equal(obj.fieldAlias);
                expect(lastOption.value).to.equal(obj.fieldName);
            });
            bdd.it('adds the new widget to additionalSearches', function () {
                widget.addAdditionalSearch(obj);

                expect(widget.additionalSearches.length).to.equal(1);
            });
        });
        bdd.describe('removeAdditionalSearches', function () {
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
            bdd.it('removes item from select and stack container', function () {
                expect(widget.select.children.length).to.equal(8);

                widget.addAdditionalSearch(obj);
                widget.addAdditionalSearch(obj2);

                expect(widget.select.children.length).to.equal(10);

                var as = widget.additionalSearches[0];
                sinon.spy(as, 'destroy');
                sinon.spy(widget.stackContainer, 'removeChild');

                widget.removeAdditionalSearches();

                expect(widget.select.children.length).to.equal(8);
                expect(as.destroy).to.have.been.called;
                expect(widget.stackContainer.removeChild).to.have.been.calledWith(as);
            });
        });
        bdd.describe('buildQueryLayers', function () {
            bdd.it('builds the correct number of query layers and headers', function () {
                widget.buildQueryLayers(mockDEQEnviroJSON.queryLayers);

                expect(query('.query-layer', widget.domNode).length).to.equal(6);
                expect(query('.query-layer-header', widget.domNode).length).to.equal(4);
            });
        });
        bdd.describe('onSelectChange', function () {
            bdd.it('clears the zoomedGeometry', function () {
                widget.zoomedGeometry = {};

                widget.onSelectChange();

                expect(widget.zoomedGeometry).to.be.null;
            });
            bdd.it('calls clear on the previous pane', function () {
                var previousPane = sinon.spy();
                var value = 'blah';
                widget.currentPane = {clear: previousPane};
                widget.select.value = 'blah';
                widget[value] = {};

                widget.onSelectChange();

                expect(previousPane).to.have.been.called;
            });
            bdd.it('fires topic when streams are selected', () => {
                topics.listen(config.topics.appSearch.onStreamSelect);

                widget.onSelectChange();

                expect(config.topics.appSearch.onStreamSelect).not.to.have.been.published();

                widget.select.value = 'stream';
                widget.onSelectChange();

                expect(config.topics.appSearch.onStreamSelect).to.have.been.published();
            });
        });
        bdd.describe('search', function () {
            var geomSearch;
            var textSearch;
            var def;
            bdd.beforeEach(function () {
                def = new Deferred();
                geomSearch = {
                    getGeometry: sinon.stub().returns(def.promise)
                };
                textSearch = {
                    getSearchParam: sinon.stub()
                };
            });
            bdd.it('calls getGeometry', function () {
                widget.currentPane = geomSearch;

                widget.search();

                expect(geomSearch.getGeometry).to.have.been.called;
            });
            bdd.it('calls getSearchParam', function () {
                widget.currentPane = textSearch;

                widget.search();

                expect(textSearch.getSearchParam).to.have.been.called;
            });
            bdd.it('displays error messages from getGeometry rejects', function () {
                var value = 'blah';
                widget.currentPane = geomSearch;

                widget.search();

                def.reject(value);

                expect(widget.errMsg.innerHTML).to.equal(value);
            });
            bdd.it('displays error messages from getSearchParam errors', function () {
                var value = 'blah';
                textSearch.getSearchParam.throws(value);
                widget.currentPane = textSearch;

                widget.search();

                expect(widget.errMsg.innerHTML).to.equal(value);
            });
            bdd.it('displays error message from getQueryLayersParam', function () {
                widget.currentPane = geomSearch;

                widget.search();

                def.resolve();

                expect(widget.errMsg.innerHTML).to.equal(widget.noQueryLayersSelectedErrMsg);
            });
            bdd.it('displays error message if no search type is selected', function () {
                widget.search();

                expect(widget.errMsg.innerHTML).to.equal(widget.noSearchTypeSelectedErrMsg);
            });
        });
        bdd.describe('getQueryLayersParam', function () {
            bdd.it('formats the data for each query layer appropriately', function () {
                widget.selectedQueryLayers = [
                    new QueryLayer({index: '1', defQuery: '01', secure: 'No'}),
                    new QueryLayer({index: '2', defQuery: '02', secure: 'No'}),
                    new QueryLayer({index: 's4', deqQuery: null, secure: 'Yes'})
                ];

                expect(widget.getQueryLayersParam()).to.deep.equal({
                    queryLayers: [
                        {id: '1', defQuery: '01'},
                        {id: '2', defQuery: '02'}
                    ],
                    secureQueryLayers: [
                        {id: '4', defQuery: null}
                    ]
                });
            });
            bdd.it('throws an error if no query layers are selected', function () {
                expect(function () {
                    widget.getQueryLayersParam();
                }).to.throw(widget.noQueryLayersSelectedErrMsg);
            });
            bdd.it('does not define queryLayers or secureQueryLayers if no features', function () {
                widget.selectedQueryLayers = [
                    new QueryLayer({index: '1', defQuery: '01', secure: 'No'}),
                    new QueryLayer({index: '2', defQuery: '02', secure: 'No'})
                ];

                expect(widget.getQueryLayersParam()).to.deep.equal({
                    queryLayers: [
                        {id: '1', defQuery: '01'},
                        {id: '2', defQuery: '02'}
                    ],
                    secureQueryLayers: null
                });

                widget.selectedQueryLayers = [
                    new QueryLayer({index: 's4', deqQuery: null, secure: 'Yes'})
                ];

                expect(widget.getQueryLayersParam()).to.deep.equal({
                    queryLayers: null,
                    secureQueryLayers: [
                        {id: '4', defQuery: null}
                    ]
                });
            });
            bdd.it('does not return duplicate query layer indexes', function () {
                widget.selectedQueryLayers = [
                    new QueryLayer({index: '1', defQuery: '01', secure: 'No'}),
                    new QueryLayer({index: '1', defQuery: '03', secure: 'No'}),
                    new QueryLayer({index: '2', defQuery: '02', secure: 'No'})
                ];

                expect(widget.getQueryLayersParam()).to.deep.equal({
                    queryLayers: [
                        {id: '1', defQuery: '01'},
                        {id: '2', defQuery: '02'}
                    ],
                    secureQueryLayers: null
                });
            })
        });
        bdd.describe('clear', function () {
            bdd.beforeEach(function () {
                config.user = {token: ''};
            });
            bdd.it('calls clear on the current search pane', function () {
                var clearSpy = sinon.spy();
                widget.currentPane = {clear: clearSpy};

                widget.clear();

                expect(clearSpy).to.have.been.called;
            });
            bdd.it('fires the clear topic', function () {
                topics.listen(config.topics.appSearch.clear);

                widget.clear();

                expect(config.topics.appSearch.clear).to.have.been.published();
            });
        });
        bdd.describe('checkSiteIDSearches', function () {
            bdd.it('hides search if not in all selected layers', function () {
                var fn = config.fieldNames.queryLayers;
                var ql = {};
                ql[fn.ID] = 'blah';
                ql[fn.NAME] = 'blah';
                widget.onAddQueryLayer(ql);

                expect(query('option:not(.hidden)', widget.select).length).to.equal(8);

                var ql2 = {};
                ql2[fn.ID] = 'blah';
                ql2[fn.NAME] = 'n/a';
                widget.onAddQueryLayer(ql2);

                expect(query('option:not(.hidden)', widget.select).length).to.equal(7);

                var ql3 = {};
                ql3[fn.ID] = 'n/a';
                ql3[fn.NAME] = 'n/a';
                widget.onAddQueryLayer(ql3);

                var ql4 = {};
                ql4[fn.ID] = 'blah';
                ql4[fn.NAME] = 'blah';
                widget.onAddQueryLayer(ql4);

                expect(query('option:not(.hidden)', widget.select).length).to.equal(6);

                widget.onRemoveQueryLayer(ql3);
                widget.onRemoveQueryLayer(ql2);

                expect(query('option:not(.hidden)', widget.select).length).to.equal(8);
            });
            bdd.it('sets back to empty if current pane is hidden', function () {
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

                expect(widget.select.value).to.equal('empty');
            });
        });
        bdd.describe('checkForMaxRecords', function () {
            bdd.it('throw an error if no max records messages', function () {
                expect(function () {
                    widget.checkForMaxRecords({});
                }).to.throw();

                expect(function () {
                    widget.checkForMaxRecords({
                        queryLayers: {message: 'blah'}
                    });
                }).to.throw();
            });
            bdd.it('extracts the layer id', function () {
                sinon.stub(config, 'getQueryLayerByIndex').returns({
                    name: 'blah',
                    metaDataUrl: 'blah'
                });
                expect(widget.checkForMaxRecords({
                    secureQueryLayers: {
                        message: 'Max records exceeded on PointsOfDiversion1. (33)'
                    }
                })).to.exist;
            });
        });
    });
});
