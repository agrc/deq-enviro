define([
    'app/search/ID',

    'dojo/dom-construct',
    'dojo/_base/window',

    'intern!bdd',

    'intern/chai!expect'
], function (
    WidgetUnderTest,

    domConstruct,
    win,

    bdd,

    expect
) {
    bdd.describe('app/search/ID', function () {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        bdd.beforeEach(function () {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, win.body()));
            widget.startup();
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a ID', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('getSearchParam', function () {
            bdd.it('returns search text', function () {
                var value = 'blah';
                widget.textBox.value = value;

                expect(widget.getSearchParam()).to.equal(value);
            });
            bdd.it('throws error', function () {
                expect(function () {
                    widget.getSearchParam();
                }).to.throw(widget.invalidMsg);
            });
        });
        bdd.describe('clear', function () {
            bdd.it('clears text box', function () {
                widget.textBox.value = 'blah';

                widget.clear();

                expect(widget.textBox.value).to.equal('');
            });
        });
    });
});
