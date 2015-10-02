define([
    'app/_PopoverMixin',

    'intern!bdd',

    'intern/chai!expect'
], function (
    ClassUnderTest,

    bdd,

    expect
) {
    var testObject;
    bdd.describe('app/_PopoverMixin', function () {
        bdd.afterEach(function () {
            if (testObject) {
                if (testObject.destroy) {
                    testObject.destroy();
                }

                testObject = null;
            }
        });
        bdd.describe('Sanity', function () {
            bdd.beforeEach(function () {
                testObject = new ClassUnderTest(null);
            });

            bdd.it('should create a _PopoverMixin', function () {
                expect(testObject).to.be.instanceOf(ClassUnderTest);
            });
        });
    });
});
