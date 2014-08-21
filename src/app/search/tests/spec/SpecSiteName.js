require([
    'app/search/SiteName',

    'dojo/_base/window',

    'dojo/dom-construct'
], function(
    WidgetUnderTest,

    win,

    domConstruct
) {
    describe('app/search/SiteName', function() {
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
            it('should create a SiteName', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('getSearchParam', function () {
            it('returns the correctly formatted search object', function () {
                widget.textBox.value = 'one two';
                widget.allRadio.checked = true;
                expect(widget.getSearchParam()).toEqual({
                    terms: ['ONE', 'TWO'],
                    includeAll: true
                });

                widget.textBox.value = 'two';
                widget.allRadio.checked = false;
                expect(widget.getSearchParam()).toEqual({
                    terms: ['TWO'],
                    includeAll: false
                });
            });
            it('throw validation errors', function () {
                expect(function () {
                    widget.getSearchParam();
                }).toThrow(widget.invalidMsg);
            });
        });
        describe('clear', function () {
            it('clears out the text box', function () {
                widget.textBox.value = 'blah';

                widget.clear();

                expect(widget.textBox.value).toBe('');
            });
        });
    });
});