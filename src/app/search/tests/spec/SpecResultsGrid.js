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
            it('calls getStoreData', function () {
                spyOn(widget, 'getStoreData');

                widget.onFeaturesFound(testdata);

                expect(widget.getStoreData).toHaveBeenCalled();
            });
        });
        describe('getStoreData', function () {
            var result;
            beforeEach(function () {
                config.queryLayerNames = {
                    '5': 'blah',
                    '7': 'blah2'
                };
                result = widget.getStoreData(testdata);
            });
            it('returns a flattened array of data', function () {
                expect(result.length).toBe(22);

                var r = result[3];

                expect(r.attributes).toBeUndefined();
                expect(r[config.fieldNames.queryLayers.ID]).toBeDefined();
                expect(r.parent).toBe('7');
                expect(result[result.length - 1].parent).toBe('15');
            });
            it('creates a unique id field that has a unique id for each feature', function () {
                var fld = config.fieldNames.queryLayers.UNIQUE_ID;

                // header
                expect(result[0][fld]).toEqual('5');

                // no feature found
                expect(result[1][fld]).toEqual('5-' + config.messages.noFeaturesFound);

                // features
                expect(result[3][fld]).toEqual('7-4302110758');
                expect(result[20][fld]).toEqual('15-84720MRCNZ10622');
            });
            it('adds feature counts to id field', function () {
                var fld = config.fieldNames.queryLayers.ID;

                expect(result[0][fld]).toEqual('blah|0');
                expect(result[2][fld]).toEqual('blah2|14');
            });
        });
    });
});
