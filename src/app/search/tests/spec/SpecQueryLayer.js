require([
    'app/search/QueryLayer',
    'app/config',

    'dojo/_base/window',

    'dojo/dom-construct',

    'matchers/topics'
], function(
    WidgetUnderTest,
    config,

    win,

    domConstruct,

    topicMatchers
) {
    describe('app/search/QueryLayer', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var index = 0;
        var topics = config.topics.appQueryLayer;

        beforeEach(function() {
            localStorage.clear();
            beforeEach(function () {
                topicMatchers.listen(topics.addLayer);
                topicMatchers.listen(topics.removeLayer);
            });
            widget = new WidgetUnderTest({
                layerName: 'blah',
                index: index,
                metaDataUrl: 'blah',
                description: 'hello'
            }, domConstruct.create('div', null, win.body()));
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a QueryLayer', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('onCheckboxChange', function () {
            describe('fires the appropriate topics', function () {
                it('checked', function () {
                    widget.checkbox.checked = true;

                    widget.onCheckboxChange();

                    expect(topics.addLayer).toHaveBeenPublishedWith(widget);
                    expect(topics.removeLayer).not.toHaveBeenPublished();
                });
                it('unchecked', function () {
                    widget.checkbox.checked = false;

                    widget.onCheckboxChange();

                    expect(topics.removeLayer).toHaveBeenPublishedWith(widget);
                    expect(topics.addLayer).not.toHaveBeenPublished();
                });
            });
        });
        describe('toJson', function () {
            it('returns the correct object', function () {
                var defQuery = 'hello';
                widget.defQuery = defQuery;

                expect(widget.toJson()).toEqual({id: index, defQuery: defQuery});
            });
        });
        describe('stores checked state in localStorage', function () {
            it('writes checked state to local storage', function () {
                widget.checkbox.checked = true;
                widget.onCheckboxChange();

                expect(localStorage[widget.localStorageID]).toBe('true');

                widget.checkbox.checked = false;
                widget.onCheckboxChange();

                expect(localStorage[widget.localStorageID]).toBe('false');
            });
            it('sets the checked property and calls onCheckboxChange if checked', function () {
                localStorage[widget.localStorageID] = false;

                widget = new WidgetUnderTest({
                    layerName: 'blah',
                    index: index,
                    metaDataUrl: 'blah',
                    description: 'hello'
                }, domConstruct.create('div', null, win.body()));

                expect(widget.checkbox.checked).toBe(false);
                expect(topics.addLayer).not.toHaveBeenPublished();

                localStorage[widget.localStorageID] = true;

                widget = new WidgetUnderTest({
                    layerName: 'blah',
                    index: index,
                    metaDataUrl: 'blah',
                    description: 'hello'
                }, domConstruct.create('div', null, win.body()));

                expect(widget.checkbox.checked).toBe(true);
                expect(topics.addLayer).toHaveBeenPublished();
            });
        });
    });
});