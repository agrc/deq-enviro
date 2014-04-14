require([
    'app/_CollapsibleMixin'

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

    describe('app/_CollapsibleMixin', function() {
        describe('Sanity', function() {
            beforeEach(function() {
                testObject = new ClassUnderTest(null);
            });

            it('should create a _CollapsibleMixin', function() {
                expect(testObject).toEqual(jasmine.any(ClassUnderTest));
            });
        });
    });
});