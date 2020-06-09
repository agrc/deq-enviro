define([
    'app/security/_LayersMixin'
], function (
    ClassUnderTest
) {
    const bdd = intern.getInterface('bdd');
    const expect = intern.getPlugin('chai').expect;

    var testObject;
    bdd.describe('app/security/_LayersMixin', function () {
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

            bdd.it('should create a _LayersMixin', function () {
                expect(testObject).to.be.instanceOf(ClassUnderTest);
            });
        });
    });
});
