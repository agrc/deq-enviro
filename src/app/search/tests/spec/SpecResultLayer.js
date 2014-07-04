require([
    'app/search/ResultLayer',
    'app/config',

    'dojo/topic',

    'dojo/text!app/search/tests/data/featureSet.json'

], function(
    ClassUnderTest,
    config,

    topic,

    fSet
) {
    describe('app/search/ResultLayer', function() {
        var testObject;
        var queryLayer = {
            color: [255, 255, 255, 0]
        };

        afterEach(function() {
            testObject = null;
        });

        beforeEach(function() {
            spyOn(config, 'getQueryLayerByIndex').and.returnValue(queryLayer);
            testObject = new ClassUnderTest([1,2,3], JSON.parse(fSet), 'point');
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
    });
});