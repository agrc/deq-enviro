require([
    'app/search/ID',

    'dojo/_base/window',

    'dojo/dom-construct'
], function(
    WidgetUnderTest,

    win,

    domConstruct
) {
    describe('app/search/ID', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function() {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, win.body()));
            widget.startup();
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a ID', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('getSearchParam', function () {
            it('returns search text', function () {
                var value = 'blah';
                widget.textBox.value = value;

                expect(widget.getSearchParam()).toEqual(value);
            });
            it('throws error', function () {
                expect(function () {
                    widget.getSearchParam();
                }).toThrow(widget.invalidMsg);
            });
        });
        describe('clear', function () {
            it('clears text box', function () {
                widget.textBox.value = 'blah';

                widget.clear();

                expect(widget.textBox.value).toBe('');
            });
        });
    });
});