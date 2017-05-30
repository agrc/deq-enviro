/* eslint-disable no-unused-expressions, no-magic-numbers */
define([
    'app/config',
    'app/search/ResultsGrid',

    'dojo/dom-construct',
    'dojo/text!tests/unit/search/data/results.json',
    'dojo/_base/lang',
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

    domConstruct,
    resultsTxt,
    lang,
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
    var widget;
    var testdata;

    bdd.describe('app/search/ResultsGrid', function () {
        sinon = sinon.sandbox.create();
        bdd.beforeEach(function () {
            topics.beforeEach();
            testdata = JSON.parse(resultsTxt);
            config.appJson = {
                queryLayers: [
                    {
                        index: '7',
                        color: [1, 2, 3, 4],
                        name: 'blah',
                        geometryType: 'point',
                        sgidName: 'SGID10.HELLO.DAQAirEmissionsInventory',
                        sortField: 'n/a',
                        legendTitle: 'n/a'
                    }, {
                        index: '15',
                        color: [1, 2, 3, 4],
                        name: 'blah2',
                        geometryType: 'point',
                        sgidName: 'SGID10.HELLO.DWQNPDESDischargers',
                        sortField: 'n/a',
                        legendTitle: 'n/a'
                    }, {
                        index: '5',
                        color: [1, 2, 3, 4],
                        name: 'blah2',
                        geometryType: 'point',
                        sgidName: 'SGID10.HELLO.FeatureClassName',
                        sortField: 'n/a',
                        legendTitle: 'n/a'
                    }, {
                        index: '11',
                        color: [1, 2, 3, 4],
                        name: 'blah2',
                        geometryType: 'point',
                        sgidName: 'SGID.HELLO.EnvironmentalIncidents',
                        sortField: 'n/a',
                        legendTitle: 'n/a'
                    }
                ]
            };
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, win.body()));
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
            bdd.it('should create a ResultsGrid', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('onFeaturesFound', function () {
            bdd.it('calls getStoreData and initGrid (only once)', function () {
                sinon.spy(widget, 'getStoreData');
                sinon.stub(widget, 'initGrid', function () {
                    widget.grid = {
                        store: { setData: function () {} },
                        refresh: function () {}
                    };
                });

                widget.onFeaturesFound(testdata);

                expect(widget.getStoreData).to.have.been.called;

                widget.onFeaturesFound(testdata);

                expect(widget.initGrid).to.have.been.calledOnce;
            });
        });
        bdd.describe('getStoreData', function () {
            var result;
            var fn = config.fieldNames.queryLayers;
            bdd.beforeEach(function () {
                // get reliable order so we can better test
                result = widget.getStoreData(testdata).sort(function (a, b) {
                    if (a[fn.UNIQUE_ID] > b[fn.UNIQUE_ID]) {
                        return 1;
                    } else if (a[fn.UNIQUE_ID] < b[fn.UNIQUE_ID]) {
                        return -1;
                    }

                    return 0;
                });
                result.forEach(function (i, ind) {
                    console.log(i[fn.UNIQUE_ID] + ' - ' + ind);
                });
            });
            bdd.it('returns a flattened array of data', function () {
                expect(result.length).to.equal(22);

                var r = result[3];

                expect(r.attributes).to.not.exist;
                expect(r[config.fieldNames.queryLayers.ID]).to.exist;
                expect(r.parent).to.equal('15');
                expect(result[result.length - 1].parent).to.equal('7');
            });
            bdd.it('creates a unique id field that has a unique id for each feature', function () {
                // header
                expect(result[0][fn.UNIQUE_ID]).to.equal('11');

                // no feature found
                expect(result[6][fn.UNIQUE_ID]).to.equal('5-' + config.messages.noFeaturesFound);

                // features
                expect(result[8][fn.UNIQUE_ID]).to.equal('7-1234');
                expect(result[3][fn.UNIQUE_ID]).to.equal('15-5678');
            });
            bdd.it('adds feature counts to id field', function () {
                expect(result[0].count).to.equal('0');
                expect(result[2].count).to.equal('2');
            });
        });
        bdd.describe('clear', function () {
            bdd.it('removes all data from the store and calls refresh on the grid', function () {
                widget.grid = {
                    store: {
                        data: 'blah'
                    },
                    refresh: sinon.spy()
                };

                widget.clear();

                expect(widget.grid.store.data).to.equal(null);
                expect(widget.grid.refresh).to.have.been.called;
            });
        });
        bdd.describe('renderRow', function () {
            // no sure how to test because of this.inherited
        });
        bdd.describe('onRowClick', function () {
            bdd.beforeEach(function () {
                widget.grid = {
                    expand: sinon.spy(),
                    row: function (row) {
                        return row;
                    }
                };
            });
            bdd.it('expands if the row is a header', function () {
                var evt = {
                    target: { className: 'blah' }
                };

                widget.onRowClick(evt);
                evt.parent = 'blah';
                widget.onRowClick(evt);

                expect(widget.grid.expand).to.have.been.calledOnce;
            });
            bdd.it('skips if the user clicked on an icon', function () {
                var evt = {
                    target: { className: 'dgrid-expando-icon' }
                };

                widget.onRowClick(evt);

                expect(widget.grid.expand).not.to.have.been.called;
            });
        });
        bdd.describe('sendDownloadData', function () {
            var t;
            bdd.beforeEach(function () {
                t = config.topics.appSearchResultsGrid.downloadFeaturesDefined;
                topics.listen(t);
            });
            bdd.it('works with selected features', function () {
                widget.grid = {
                    selection: {
                        '15-UTUCCF7CA8AE7A': true,
                        '7-4302130002': true,
                        '7-4302130008': true,
                        '7-4302130010': true,
                        '15-UTU49F5F53A5CA': true,
                        '11-5260': true
                    }
                };
                widget.sendDownloadData();

                expect(t).to.have.been.published();
                expect(t).to.have.been.publishedWith({
                    DWQNPDESDischargers: ['UTUCCF7CA8AE7A', 'UTU49F5F53A5CA'],
                    DAQAirEmissionsInventory: ['4302130002', '4302130008', '4302130010'],
                    EnvironmentalIncidents: ['5260']
                });
            });
            bdd.it('returns all features if none are selected', function () {
                widget.onFeaturesFound(testdata);

                expect(t).to.have.been.published();
                expect(t).to.have.been.publishedWith({
                    DAQAirEmissionsInventory: ['4302110758', '4302120100', '4302130001', '4302130002', '4302130003',
                        '4302130004', '4302130005', '4302130006', '4302130007', '4302130008', '4302130009',
                        '4302130010', '4302130011', '4302150001'],
                    DWQNPDESDischargers: ['84720MRCNZ10622', '84720WSTRN997NO']
                });
            });
        });
        bdd.describe('sortValues', function () {
            var opts = {
                attribute: 'fieldname',
                descending: false
            };
            bdd.it('sorts strings', function () {
                expect(widget.sortValues(opts, { fieldname: 'a' }, { fieldname: 'b' }))
                    .to.equal(-1);
            });
            bdd.it('sorts as numbers if possible', function () {
                expect(widget.sortValues(opts, { fieldname: '4' }, { fieldname: '10' }))
                    .to.equal(-1);
            });
            bdd.it('can handle capital letters', function () {
                expect(widget.sortValues(opts, { fieldname: 'tooele' }, { fieldname: 'Woodside' }))
                    .to.equal(-1);
            });
            bdd.it('can handle whitespace', function () {
                expect(widget.sortValues(opts, { fieldname: 'a' }, { fieldname: ' b' }))
                    .to.equal(-1);
            });
            bdd.it('sorts the entire id', function () {
                var list = [{
                    value: '06001WS003'
                }, {
                    value: '06001WS008'
                }, {
                    value: '06002WS001'
                }, {
                    value: '06001WS006'
                }];
                var sorted = [{
                    value: '06001WS003'
                }, {
                    value: '06001WS006'
                }, {
                    value: '06001WS008'
                }, {
                    value: '06002WS001'
                }];
                var sortOptions = {
                    attribute: 'value',
                    descending: false
                };
                list.sort(lang.partial(widget.sortValues, sortOptions));
                expect(list).to.deep.equal(sorted);
            });
        });
        bdd.describe('getSortedQueryLayerIds', function () {
            bdd.it('sorts the query layers to match the passed in array', function () {
                var sorted = widget.getSortedQueryLayerIds(testdata, config.appJson.queryLayers);

                expect(sorted).to.deep.equal(['7', '15', '5', '11']);
            });
        });
    });
});
