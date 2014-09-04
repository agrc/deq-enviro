require([
    'app/download/Download',

    'app/config',

    'dojo/topic',

    'dojo/dom-class',
    'dojo/dom-construct'
], function(
    WidgetUnderTest,

    config,

    topic,

    domClass,
    domConstruct
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

        describe('initial search topic', function() {
            describe('multiple program results', function() {
                it('displays the correct count of results', function() {
                    var response = {
                        'result': {
                            '5': [{}, {}, {}, {}, {}],
                            '6': [{}, {}, {}, {}, {}, {}]
                        }
                    };

                    topic.publish(config.topics.appSearchResultsGrid.downloadFeaturesDefined, response.result);

                    expect(widget.get('count')).toEqual(11);
                });
                it('displays 0', function() {
                    var response = {
                        'result': {
                            '5': [],
                            '6': []
                        }
                    };

                    topic.publish(config.topics.appSearchResultsGrid.downloadFeaturesDefined, response.result);
                    expect(widget.get('count')).toEqual(0);
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
                it('widget should be visible when there are no results', function() {
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
            });
        });
    });
});