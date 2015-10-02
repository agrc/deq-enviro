define([
    'app/search/AdditionalSearch',

    'dojo/dom-construct',

    'intern!bdd',

    'intern/chai!expect'
], function (
    WidgetUnderTest,

    domConstruct,

    bdd,

    expect
) {
    bdd.describe('app/search/AdditionalSearch', function () {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        bdd.beforeEach(function () {
            widget = new WidgetUnderTest({
                fieldName: 'FieldName',
                fieldAlias: 'Field Alias',
                fieldType: 'text'
            }, domConstruct.create('div', null, document.body));
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a AdditionalSearch', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('getSearchParam', function () {
            bdd.it('returns the correct object', function () {
                widget.textBox.value = 'blah';

                expect(widget.getSearchParam())
                    .to.equal('upper(FieldName) LIKE upper(\'%blah%\')');

                widget.textBox.value = 'blah blah2';

                expect(widget.getSearchParam())
                    .to.equal('upper(FieldName) LIKE upper(\'%blah%\')' +
                        ' AND upper(FieldName) LIKE upper(\'%blah2%\')');

                widget.anyRadio.click();

                expect(widget.getSearchParam())
                    .to.equal('upper(FieldName) LIKE upper(\'%blah%\')' +
                        ' OR upper(FieldName) LIKE upper(\'%blah2%\')');

                widget.fieldType = 'number';
                widget.textBox.value = 'num';

                expect(widget.getSearchParam())
                    .to.equal('FieldName = num');
            });
        });
    });
});
