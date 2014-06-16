require([
    'app/search/ResultsGrid',
    'app/config',

    'dojo/_base/window',

    'dojo/dom-construct',
    'dojo/text!app/search/tests/data/results.json'
], function(
    WidgetUnderTest,
    config,

    win,

    domConstruct,
    resultsTxt
) {

    var widget;
    var testdata = JSON.parse(resultsTxt);

    beforeEach(function() {
        widget = new WidgetUnderTest(null, domConstruct.create('div', null, win.body()));
    });

    afterEach(function() {
        if (widget) {
            widget.destroy();
            widget = null;
        }
    });

    describe('app/search/ResultsGrid', function() {
        describe('Sanity', function() {
            it('should create a ResultsGrid', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('onFeaturesFound', function () {
            it('calls getStoreData and initGrid (only once)', function () {
                spyOn(widget, 'getStoreData');
                spyOn(widget, 'initGrid').and.callFake(function () {
                    widget.grid = {
                        store: {setData: function () {}},
                        refresh: function () {}
                    };
                });

                widget.onFeaturesFound(testdata);

                expect(widget.getStoreData).toHaveBeenCalled();

                widget.onFeaturesFound(testdata);

                expect(widget.initGrid.calls.count()).toBe(1);
            });
        });
        describe('getStoreData', function () {
            var result;
            var fn = config.fieldNames.queryLayers;
            beforeEach(function () {
                config.queryLayerNames = {
                    '11': 'blah',
                    '15': 'blah2'
                };
                // get reliable order so we can better test
                result = widget.getStoreData(testdata).sort(function (a, b) {
                    if(a[fn.UNIQUE_ID] > b[fn.UNIQUE_ID]) {
                        return 1;
                    } else if (a[fn.UNIQUE_ID] < b[fn.UNIQUE_ID]) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
                result.forEach(function (i, ind) {
                    console.log(i[fn.UNIQUE_ID] + ' - ' + ind);
                });
            });
            it('returns a flattened array of data', function () {
                expect(result.length).toBe(22);

                var r = result[3];

                expect(r.attributes).toBeUndefined();
                expect(r[config.fieldNames.queryLayers.ID]).toBeDefined();
                expect(r.parent).toBe('15');
                expect(result[result.length - 1].parent).toBe('7');
            });
            it('creates a unique id field that has a unique id for each feature', function () {
                // header
                expect(result[0][fn.UNIQUE_ID]).toEqual('11');

                // no feature found
                expect(result[6][fn.UNIQUE_ID]).toEqual('5-' + config.messages.noFeaturesFound);

                // features
                expect(result[8][fn.UNIQUE_ID]).toEqual('7-4302110758');
                expect(result[3][fn.UNIQUE_ID]).toEqual('15-84720MRCNZ10622');
            });
            it('adds feature counts to id field', function () {
                expect(result[0][fn.ID]).toEqual('blah|0');
                expect(result[2][fn.ID]).toEqual('blah2|2');
            });
        });
        describe('clear', function () {
            it('removes all data from the store and calls refresh on the grid', function () {
                widget.grid = {
                    store: {
                        data: 'blah'
                    },
                    refresh: jasmine.createSpy('refresh')
                };

                widget.clear();

                expect(widget.grid.store.data).toEqual(null);
                expect(widget.grid.refresh).toHaveBeenCalled();
            });
        });
        describe('renderRow', function () {
            // no sure how to test because of this.inherited
        });
    });
});
