define([
    'intern/order!jquery',
    'intern/order!app/_CollapsibleMixin',

    'intern!bdd',

    'intern/chai!expect'
], function (
    $,
    ClassUnderTest,

    bdd,

    expect
) {
    var testObject;
    bdd.describe('app/_CollapsibleMixin', function () {
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

            bdd.it('should create a _CollapsibleMixin', function () {
                expect(testObject).to.be.instanceOf(ClassUnderTest);
            });
        });
    });
});
