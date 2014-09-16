require([
    'app/download/Download',

    'app/config',

    'dojo/topic',

    'dojo/dom-class',
    'dojo/dom-construct',

    'stubmodule'
], function(
    WidgetUnderTest,

    config,

    topic,

    domClass,
    domConstruct,

    stubmodule
) {
    describe('app/download/Download', function() {
        var widget;
        var destroy = function(widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function() {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, document.body));
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a Download', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });

        describe('update count after topic fires', function() {
            describe('multiple program results', function() {
                it('displays the correct count of results', function() {
                    var response = {
                        'result': {
                            '5': [{}, {}, {}, {}, {}],
                            '6': [{}, {}, {}, {}, {}, {}]
                        }
                    };

                    topic.publish(config.topics.appSearchResultsGrid.downloadFeaturesDefined, response.result);

                    expect(widget.get('count')).toEqual('11');
                });
                it('displays 0', function() {
                    var response = {
                        'result': {
                            '5': [],
                            '6': []
                        }
                    };

                    topic.publish(config.topics.appSearchResultsGrid.downloadFeaturesDefined, response.result);
                    expect(widget.get('count')).toEqual('0');
                });
                it('can adds commas', function () {
                    var a = [];
                    a.length = 1000;
                    widget.updateCount({'test': a});

                    expect(widget.get('count')).toEqual('1,000');
                });
            });
        });
        describe('Visibility of widget', function() {
            it('widget should be hidden when there are no results', function() {
                var response = {
                    'result': {
                        '5': [],
                        '6': []
                    }
                };

                topic.publish(config.topics.appSearchResultsGrid.downloadFeaturesDefined, response.result);

                expect(domClass.contains(widget.domNode, 'hidden')).toEqual(true);
                expect(domClass.contains(widget.domNode, 'show')).toEqual(false);
            });
            it('widget should be visible when there are results', function() {
                var response = {
                    'result': {
                        '5': [{}],
                        '6': []
                    }
                };

                topic.publish(config.topics.appSearchResultsGrid.downloadFeaturesDefined, response.result);

                expect(domClass.contains(widget.domNode, 'show')).toEqual(true);
                expect(domClass.contains(widget.domNode, 'hidden')).toEqual(false);
            });
            it('can handle commas', function () {
                widget.updateVisibility('1,000');

                expect(domClass.contains(widget.domNode, 'show')).toEqual(true);
                expect(domClass.contains(widget.domNode, 'hidden')).toEqual(false);
            });
        });
        describe('download', function () {
            it('show\'s error message if no format is selected', function () {
                spyOn(widget, 'showErrMsg');
                widget.download();

                expect(widget.showErrMsg).toHaveBeenCalledWith(widget.noFormatMsg);
            });
            it('sends the proper parameters to the gp tool', function (done) {
                stubmodule('app/download/Download', {
                    'app/map/MapController': {map: {showLoader: function () {}}}
                }).then(function (StubbedModule) {
                    var testWidget2 = new StubbedModule({}, domConstruct.create('div', {}, document.body));
                    var type = 'xls';
                    testWidget2.fileTypes.value = type;
                    var idMap = {};
                    testWidget2.downloadFeatures = idMap;
                    expect(testWidget2.download()).toEqual({
                        'table_id_map': '{}',
                        'file_type': type
                    });
                    destroy(testWidget2);
                    done();
                });
            });
        });
    });
});