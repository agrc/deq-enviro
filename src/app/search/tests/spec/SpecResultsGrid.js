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
            it('returns a flattened array of data', function () {
                config.queryLayerNames = {};
                config.queryLayerNames['7'] = 'blah';
                config.queryLayerNames['15'] = 'blah2';
                var result = widget.getStoreData(testdata);

                expect(result.length).toBe(22);

                var r = result[3];

                expect(r.attributes).toBeUndefined();
                expect(r[config.fieldNames.queryLayers.ID]).toBeDefined();
                expect(r.parent).toBe('blah');
                expect(result[result.length - 1].parent).toBe('blah2');
            });
        });
    });
});
