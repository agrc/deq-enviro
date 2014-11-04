require([
    'app/search/QueryLayerFilter',
    'app/search/DateFilter',

    'dojo/dom-construct'
], function(
    WidgetUnderTest,
    DateFilter,

    domConstruct
) {
    describe('app/search/QueryLayerFilter', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function() {
            widget = new WidgetUnderTest({
                popoverBtn: domConstruct.create('a'),
                filterTxt: 'date: Date_Discovered (Date Discovered); ' +
                    'checkbox: TANK = 0 (Tank Status: Closed), TANK = 1 (Tank Status: Open)'
            }, domConstruct.create('div', null, document.body));
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a QueryLayerFilter', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });

        describe('postCreate', function () {
            it('builds the appropriate filters', function () {
                var f = widget.filters[0];
                expect(f).toEqual(jasmine.any(DateFilter));
            });
        });
        describe('onApplyBtnClick', function () {
            it('combines all of the filter queries', function () {
                widget.filters = [{
                    getQuery: function () {return 'blah1';}
                },{
                    getQuery: function () {return 'blah2';}
                },{
                    getQuery: function () {return 'blah3';}
                }];

                spyOn(widget, 'onApply');

                widget.onApplyBtnClick();

                expect(widget.onApply).toHaveBeenCalledWith('blah1 AND blah2 AND blah3');
            });
        });
    });
});
