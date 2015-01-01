require([
    'app/search/QueryLayer',
    'app/config',

    'dojo/_base/window',
    'dojo/dom-class',
    'dojo/dom-attr',

    'dojo/dom-construct',

    'matchers/topics'
], function(
    WidgetUnderTest,
    config,

    win,
    domClass,
    domAttr,

    domConstruct,

    topicMatchers
) {
    describe('app/search/QueryLayer', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var index = '0';
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
                description: 'hello',
                additionalSearches: 'n/a'
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
        describe('postCreate', function () {
            it('parses additional searches correctly', function () {
                var widget2 = new WidgetUnderTest({
                    layerName: 'blah',
                    index: index,
                    metaDataUrl: 'blah',
                    description: 'hello',
                    additionalSearches: 'COMPANY_NAME|text (Operator Name), ' +
                        'FIELD_NUM|number (Field Number), FIELD_NAME|text (Field Name)'
                }, domConstruct.create('div', null, win.body()));

                expect(widget2.additionalSearchObjects.length).toBe(3);
                expect(widget2.additionalSearchObjects[0]).toEqual({
                    fieldName: 'COMPANY_NAME',
                    fieldType: 'text',
                    fieldAlias: 'Operator Name'
                });

                destroy(widget2);
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
            var defQuery;
            beforeEach(function () {
                defQuery = 'hello';
                widget.defQuery = defQuery;
            });
            it('returns the correct object', function () {
                expect(widget.toJson()).toEqual({id: index, defQuery: defQuery});
            });
            it('removes the s for secured layers', function () {
                widget.secure = 'Yes';
                widget.index = 's1';

                expect(widget.toJson()).toEqual({id: '1', defQuery: defQuery});
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

                destroy(widget);
                widget = new WidgetUnderTest({
                    layerName: 'blah',
                    index: index,
                    metaDataUrl: 'blah',
                    description: 'hello',
                    additionalSearches: 'n/a'
                }, domConstruct.create('div', null, win.body()));

                expect(widget.checkbox.checked).toBe(false);
                expect(topics.addLayer).not.toHaveBeenPublished();

                localStorage[widget.localStorageID] = true;

                destroy(widget);
                widget = new WidgetUnderTest({
                    layerName: 'blah',
                    index: index,
                    metaDataUrl: 'blah',
                    description: 'hello',
                    additionalSearches: 'n/a'
                }, domConstruct.create('div', null, win.body()));

                expect(widget.checkbox.checked).toBe(true);
                expect(topics.addLayer).toHaveBeenPublished();
            });
        });
        describe('toggleDisabledState', function () {
            it('sets the appropriate disabled dom properties', function () {
                widget.toggleDisabledState(true);

                expect(domClass.contains(widget.domNode, 'disabled')).toBe(true);
                expect(domAttr.get(widget.checkbox, 'disabled')).toBe(true);
            });
        });
        describe('checkSecurity', function () {
            it('checks against the layers prop', function () {
                spyOn(widget, 'toggleDisabledState');

                var user = {
                    accessRules: {
                        options: {
                            layers: [0]
                        }
                    }
                };
                widget.checkSecurity(user);

                expect(widget.toggleDisabledState).toHaveBeenCalledWith(false);

                user.accessRules.options.layers = [1, 3];
                widget.checkSecurity(user);

                expect(widget.toggleDisabledState.calls.mostRecent().args[0]).toEqual(true);
            });
        });
    });
});
