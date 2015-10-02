define([
    'app/App',

    'dojo/dom-class',
    'dojo/dom-construct',

    'intern!bdd',

    'intern/chai!expect'
],

function (
    App,

    domClass,
    domConstruct,

     bdd,

    expect
) {
    bdd.describe('app/App', function () {
        var testWidget;
        bdd.beforeEach(function () {
            testWidget = new App({}, domConstruct.create('div', {}, document.body));
            testWidget.startup();
        });
        bdd.afterEach(function () {
            testWidget.destroyRecursive();
            testWidget = null;
        });

        bdd.it('creates a valid object', function () {
            expect(testWidget).to.be.instanceOf(App);
        });

        bdd.describe('switchBottomPanel', function () {
            var panel;
            var panel2;
            bdd.beforeEach(function () {
                panel = testWidget.identifyPane;
                panel2 = testWidget.resultsGrid;
            });
            bdd.it('removes `hidden` class from passed in element', function () {
                domClass.add(panel.domNode, 'hidden');

                testWidget.switchBottomPanel(panel.domNode);

                return expect(domClass.contains(panel.domNode, 'hidden')).to.equal(false);
            });
            bdd.it('adds `hidden` class to the other element', function () {
                domClass.remove(panel.domNode, 'hidden');

                testWidget.switchBottomPanel(panel2);

                return expect(domClass.contains(panel.domNode, 'hidden')).to.equal(true);
            });
        });
    });
});
