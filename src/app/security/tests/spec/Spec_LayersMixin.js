require([
    'app/security/_LayersMixin'

], function(
    ClassUnderTest
) {

    var testObject;

    afterEach(function() {
        if (testObject) {
            if (testObject.destroy) {
                testObject.destroy();
            }

            testObject = null;
        }
    });

    describe('app/security/_LayersMixin', function() {
        describe('Sanity', function() {
            beforeEach(function() {
                testObject = new ClassUnderTest(null);
            });

            it('should create a _LayersMixin', function() {
                expect(testObject).toEqual(jasmine.any(ClassUnderTest));
            });
        });
    });
});