/* eslint-disable no-unused-expressions, no-magic-numbers */
define([
    'app/search/ID',

    'dojo/dom-construct',
    'dojo/_base/window'
], function (
    WidgetUnderTest,

    domConstruct,
    win
) {
    const bdd = intern.getInterface('bdd');
    const expect = intern.getPlugin('chai').expect;

    bdd.describe('app/search/ID', function () {
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
