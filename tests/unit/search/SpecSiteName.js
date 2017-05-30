define([
    'app/search/SiteName',

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
    bdd.describe('app/search/SiteName', function () {
        var widget;
        var destroy = function (destroyWidget) {
            destroyWidget.destroyRecursive();
            destroyWidget = null;
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
            bdd.it('should create a SiteName', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('getSearchParam', function () {
            bdd.it('returns the correctly formatted search object', function () {
                widget.textBox.value = 'one two';
                widget.allRadio.checked = true;
                expect(widget.getSearchParam()).to.deep.equal({
                    terms: ['one', 'two'],
                    includeAll: true
                });

                widget.textBox.value = 'two';
                widget.allRadio.checked = false;
                expect(widget.getSearchParam()).to.deep.equal({
                    terms: ['two'],
                    includeAll: false
                });
            });
            bdd.it('throw validation errors', function () {
                expect(function () {
                    widget.getSearchParam();
                }).to.throw(widget.invalidMsg);
            });
        });
        bdd.describe('clear', function () {
            bdd.it('clears out the text box', function () {
                widget.textBox.value = 'blah';

                widget.clear();

                expect(widget.textBox.value).to.equal('');
            });
        });
    });
});
