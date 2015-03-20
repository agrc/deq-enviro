require([
    'app/search/ResultLayer',
    'app/config',

    'dojo/topic',

    'dojo/text!app/search/tests/data/featureSet.json',

    'matchers/topics'

], function(
    ClassUnderTest,
    config,

    topic,

    fSet,

    topicMatchers
) {
    describe('app/search/ResultLayer', function() {
        var testObject;
        var queryLayer = {
            color: [255, 255, 255, 0],
            sortField: 'n/a',
            index: '1'
        };
        var layerIndex = '14';

        afterEach(function() {
            testObject = null;
        });

        beforeEach(function() {
            spyOn(config, 'getQueryLayerByIndex').and.returnValue(queryLayer);
            testObject = new ClassUnderTest([1,2,3], [1,2,3], 'point', layerIndex);
            topicMatchers.listen(config.topics.appSearch.identify);
        });

        describe('Sanity', function() {
            it('should create a ResultLayer', function() {
                expect(testObject).toEqual(jasmine.any(ClassUnderTest));
            });
            it('show subscribe to the search start and destroy itself', function () {
                spyOn(testObject, 'destroy');

                topic.publish(config.topics.appSearch.searchStarted);

                expect(testObject.destroy).toHaveBeenCalled();
            });
        });
        describe('onClick', function () {
            it('passes the appropriate data to the topic', function () {
                var oid = 123;
                var g = {
                    attributes: {OBJECTID: oid}
                };
                var spy = jasmine.createSpy('stopPropagation');
                testObject.onClick({graphic: g, stopPropagation: spy});

                expect(config.topics.appSearch.identify).toHaveBeenPublishedWith({
                    parent: testObject.layerIndex,
                    OBJECTID: oid
                });
                expect(spy).toHaveBeenCalled();
            });
        });
    });
});