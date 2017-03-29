define([
    'app/search/Coordinates',

    'dojo/dom-construct',

    'intern!bdd'
], function (
    Coordinates,

    domConstruct,

    bdd
) {
    bdd.describe('app/search/Coordinates', () => {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
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
