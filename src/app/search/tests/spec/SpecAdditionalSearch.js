require([
    'app/search/AdditionalSearch',

    'dojo/dom-construct'
], function(
    WidgetUnderTest,

    domConstruct
) {
    describe('app/search/AdditionalSearch', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function() {
            widget = new WidgetUnderTest({
                fieldName: 'FieldName',
                fieldAlias: 'Field Alias',
                fieldType: 'text'
            }, domConstruct.create('div', null, document.body));
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a AdditionalSearch', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('getSearchParam', function () {
            it('returns the correct object', function () {
                widget.textBox.value = 'blah';

                expect(widget.getSearchParam())
                    .toEqual('upper(FieldName) LIKE upper(\'%blah%\')');

                widget.textBox.value = 'blah blah2';

                expect(widget.getSearchParam())
                    .toEqual('upper(FieldName) LIKE upper(\'%blah%\')' +
                        ' AND upper(FieldName) LIKE upper(\'%blah2%\')');

                widget.anyRadio.click();

                expect(widget.getSearchParam())
                    .toEqual('upper(FieldName) LIKE upper(\'%blah%\')' +
                        ' OR upper(FieldName) LIKE upper(\'%blah2%\')');

                widget.fieldType = 'number';
                widget.textBox.value = 'num';

                expect(widget.getSearchParam())
                    .toEqual('FieldName = num');
            });
        });
    });
});
