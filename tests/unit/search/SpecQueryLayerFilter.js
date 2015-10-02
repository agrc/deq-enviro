define([
    'app/search/DateFilter',
    'app/search/QueryLayerFilter',

    'dojo/dom-construct',

    'intern!bdd',

    'intern/chai!',
    'intern/chai!expect',

    'sinon',

    'sinon-chai'
], function (
    DateFilter,
    WidgetUnderTest,

    domConstruct,

    bdd,

    chai,
    expect,

    sinon,

    sinonChai
) {
    chai.use(sinonChai);
    bdd.describe('app/search/QueryLayerFilter', function () {
        sinon = sinon.sandbox.create();
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        bdd.beforeEach(function () {
            widget = new WidgetUnderTest({
                popoverBtn: domConstruct.create('a'),
                filterTxt: 'date: Date_Discovered (Date Discovered); ' +
                    'checkbox: TANK = 0 (Tank Status: Closed), TANK = 1 (Tank Status: Open)'
            }, domConstruct.create('div', null, document.body));
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
            sinon.restore();
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a QueryLayerFilter', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });

        bdd.describe('postCreate', function () {
            bdd.it('builds the appropriate filters', function () {
                var f = widget.filters[0];
                expect(f).to.be.instanceOf(DateFilter);
            });
        });
        bdd.describe('onApplyBtnClick', function () {
            bdd.it('combines all of the filter queries', function () {
                widget.filters = [{
                    getQuery: function () {
                        return 'blah1';
                    }
                },{
                    getQuery: function () {
                        return 'blah2';
                    }
                },{
                    getQuery: function () {
                        return 'blah3';
                    }
                }];

                sinon.spy(widget, 'onApply');

                widget.onApplyBtnClick();

                expect(widget.onApply).to.have.been.calledWith('blah1 AND blah2 AND blah3');
            });
        });
    });
});
