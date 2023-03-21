define([
    'app/map/MapController',
    'app/search/Coordinates',

    'dojo/dom-construct'
], function (
    MapController,
    Coordinates,

    domConstruct
) {
    const bdd = intern.getInterface('bdd');
    const expect = intern.getPlugin('chai').expect;

    bdd.describe('app/search/Coordinates', () => {
        var widget;
        var destroy = function (destroyWidget) {
            destroyWidget.destroyRecursive();
            destroyWidget = null;
        };
        MapController.map = {
            addLayer: function () {}
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
