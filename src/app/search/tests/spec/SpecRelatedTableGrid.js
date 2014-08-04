require([
    'app/search/RelatedTableGrid',
    'app/config',

    'dojo/dom-construct',
    'dojo/dom-class'
], function(
    WidgetUnderTest,
    config,

    domConstruct,
    domClass
) {
    describe('app/search/RelatedTableGrid', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var container;

        beforeEach(function() {
            container = domConstruct.create('div');
            spyOn(config, 'getRelatedTableByIndex').and.returnValue({
                fields: [['blah', 'blah']],
                index: 33
            });
            widget = new WidgetUnderTest({
                records: [],
                tableId: 34,
                pillsDiv: container
            }, domConstruct.create('div', null, document.body));
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a RelatedTableGrid', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('createPill', function () {
            beforeEach(function () {
                domConstruct.empty(container);
            });
            it('creates a li element', function () {
                widget.createPill(container, 'blah');

                expect(container.children.length).toBe(1);
                expect(domClass.contains(container.children[0], 'active')).toBe(true);
            });
            it('assigns the active class only if it\'s the first one', function () {
                domConstruct.create('li', null, container);

                widget.createPill(container, 'blah');

                expect(domClass.contains(container.children[1], 'active')).toBe(false);
            });
        });
    });
});
