define([
    'app/search/Coordinates',

    'dojo/dom-construct',

    'intern!bdd',

    'intern/chai!expect'
], function (
    Coordinates,

    domConstruct,

    bdd,

    expect
) {
    bdd.describe('app/search/Coordinates', () => {
        var widget;
        var destroy = function (destroyWidget) {
            destroyWidget.destroyRecursive();
            destroyWidget = null;
        };

        bdd.beforeEach(() => {
            widget = new Coordinates(null, domConstruct.create('div', null, document.body));
        });

        bdd.afterEach(() => {
            if (widget) {
                destroy(widget);
            }
        });

        bdd.it('Sanity', () => {
            expect(widget).to.be.instanceOf(Coordinates);
        });
    });
});
