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
            color: [255, 255, 255, 0]
        };
        var layerIndex = '14';

        afterEach(function() {
            testObject = null;
        });

        beforeEach(function() {
            spyOn(config, 'getQueryLayerByIndex').and.returnValue(queryLayer);
            testObject = new ClassUnderTest([1,2,3], JSON.parse(fSet), 'point', layerIndex);
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
                var geo = {hello: 'hello'};
                var oid = 123;
                var g = {
                    attributes: {OBJECTID: oid},
                    geometry: geo
                };
                testObject.onClick({graphic: g});

                expect(config.topics.appSearch.identify).toHaveBeenPublishedWith({
                    parent: testObject.layerIndex,
                    geometry: geo,
                    OBJECTID: oid
                });
            });
        });
    });
});