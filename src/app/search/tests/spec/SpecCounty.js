require([
    'app/search/County',
    'app/config',

    'dojo/_base/window',

    'dojo/dom-construct',
    'dojo/Deferred',

    'matchers/topics'
], function(
    WidgetUnderTest,
    config,

    win,

    domConstruct,
    Deferred,

    topics
) {
    describe('app/search/County', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function() {
            widget = new WidgetUnderTest({}, domConstruct.create('div', null, win.body()));
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a County', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('onChange', function () {
            it('searches for counties and state', function () {
                widget.api.search = jasmine.createSpy('search').and.returnValue({then: function () {}});

                widget.select.value = 'STATEWIDE';

                widget.onChange();

                expect(widget.api.search.calls.mostRecent().args[0])
                    .toEqual(config.featureClassNames.utah);

                widget.select.value = 'KANE';

                widget.onChange();

                expect(widget.api.search.calls.mostRecent().args[0])
                    .toEqual(config.featureClassNames.counties);
            });
            it('publishes topic with returned geometry', function () {
                topics.listen(config.topics.appMapMapController.zoomTo);
                var def = new Deferred();
                spyOn(widget.api, 'search').and.returnValue(def.promise);
                var geo = {};

                widget.onChange();

                def.resolve([{geometry: geo}]);

                expect(config.topics.appMapMapController.zoomTo).toHaveBeenPublished();
            });
            it('shows error message', function () {
                var value = 'error message';
                var def = new Deferred();
                spyOn(widget.api, 'search').and.returnValue(def.promise);

                widget.onChange();

                def.reject(value);

                expect(widget.errMsg.innerHTML).toEqual(value);
            });
            it('set\'s geometry prop for later retrieval', function () {
                var def = new Deferred();
                spyOn(widget.api, 'search').and.returnValue(def.promise);
                var geo = {rings: [1,2]};

                widget.onChange();

                def.resolve([{geometry: geo}]);

                expect(widget.geometry.rings).toEqual(geo.rings);
            });
        });
        describe('getGeometry', function () {
            it('returns last zoomed to geometry', function (done) {
                var geo = {};
                widget.geometry = geo;

                widget.getGeometry().then(function (g) {
                    expect(g).toEqual(geo);
                    done();
                });
            });
        });
        describe('_onShow', function () {
            it('grabs state extent on first show', function () {
                spyOn(widget.api, 'search').and.callFake(function () {
                    widget.geometry = {};
                    return {then: function () {}};
                });

                widget._onShow();
                widget._onShow();

                expect(widget.api.search.calls.count()).toBe(1);
            });
        });
        describe('clear', function () {
            it('clears the graphic', function () {
                widget.geometry = {};

                topics.listen(config.topics.appMapMapController.clearGraphics);

                widget.clear();

                expect(widget.geometry).toBeNull();
                expect(config.topics.appMapMapController.clearGraphics).toHaveBeenPublished();
            });
            it('resets the select', function () {
                widget.select.selectedIndex = 1;

                widget.clear();

                expect(widget.select.selectedIndex).toBe(0);
            });
        });
    });
});