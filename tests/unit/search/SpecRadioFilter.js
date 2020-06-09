/* eslint-disable no-unused-expressions, no-magic-numbers */
define([
    'app/search/RadioFilter',

    'dojo/dom-construct'
], function (
    WidgetUnderTest,

    domConstruct
) {
    const bdd = intern.getInterface('bdd');
    const expect = intern.getPlugin('chai').expect;

    bdd.describe('app/search/RadioFilter', function () {
        var widget;
        var destroy = function (destroyWidget) {
            destroyWidget.destroyRecursive();
            destroyWidget = null;
        };

        bdd.beforeEach(function () {
            widget = new WidgetUnderTest({
                filterTxt: 'RELEASE = 1 (Has Release(s)), OPENRELEASE = ' +
                    '1 (Has Open Release(s)), OPENRELEASE = 0 (Has Closed Release(s))'
            }, domConstruct.create('div', null, document.body));
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a RadioFilter', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('postCreate', function () {
            bdd.it('creates the radio buttons', function () {
                expect(widget.items.length).to.equal(3);

                var first = widget.items[0];
                expect(first.value).to.equal('RELEASE = 1');
            });
        });
        bdd.describe('getQuery', function () {
            bdd.it('gets the right query', function () {
                widget.items[0].item.click();
                widget.items[1].item.click();

                expect(widget.getQuery()).to.equal('OPENRELEASE = 1');
            });
        });
    });
});
