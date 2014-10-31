require([
    'app/search/CheckboxFilter',

    'dojo/dom-construct'
], function(
    WidgetUnderTest,

    domConstruct
) {
    describe('app/search/CheckboxFilter', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function() {
            widget = new WidgetUnderTest({
                filterTxt: 'TANK = 0 (Tank Status: Closed), TANK = 1 (Tank Status: Open)'
            }, domConstruct.create('div', null, document.body));
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a CheckboxFilter', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
    });
});
