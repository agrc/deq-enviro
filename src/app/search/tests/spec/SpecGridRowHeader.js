require([
    'app/search/GridRowHeader',

    'dojo/_base/window',

    'dojo/dom-construct',

    'app/config'
], function(
    WidgetUnderTest,

    win,

    domConstruct,

    config
) {
    describe('app/search/GridRowHeader', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function() {
            spyOn(config, 'getQueryLayerByIndex').and.returnValue({
                index: '2',
                legendTitle: 'n/a'
            });
            widget = new WidgetUnderTest({
                name: 'Scott',
                count: 15,
                color: [1,2,3]
            }, domConstruct.create('div', {}, win.body()));
            widget.startup();
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a GridRowHeader', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
    });
});
