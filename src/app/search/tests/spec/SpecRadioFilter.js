require([
    'app/search/RadioFilter',

    'dojo/dom-construct'
], function(
    WidgetUnderTest,

    domConstruct
) {
    describe('app/search/RadioFilter', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function() {
            widget = new WidgetUnderTest({
                filterTxt: 'RELEASE = 1 (Has Release(s)), OPENRELEASE = ' +
                    '1 (Has Open Release(s)), OPENRELEASE = 0 (Has Closed Release(s))'
            }, domConstruct.create('div', null, document.body));
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a RadioFilter', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('postCreate', function () {
            it('creates the radio buttons', function () {
                expect(widget.items.length).toBe(3);

                var first = widget.items[0];
                expect(first.value).toBe('RELEASE = 1');
            });
        });
        describe('getQuery', function () {
            it('gets the right query', function () {
                widget.items[0].item.click();
                widget.items[1].item.click();

                expect(widget.getQuery()).toBe('OPENRELEASE = 1');
            });
        });
    });
});
