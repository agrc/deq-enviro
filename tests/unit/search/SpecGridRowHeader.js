define([
    'app/config',
    'app/search/GridRowHeader',

    'dojo/dom-construct',
    'dojo/dom-class',
    'dojo/_base/window',

    'intern!bdd',

    'intern/chai!',
    'intern/chai!expect',

    'sinon',

    'sinon-chai'
], function (
    config,
    WidgetUnderTest,

    domConstruct,
    domClass,
    win,

    bdd,

    chai,
    expect,

    sinon,

    sinonChai
) {
    chai.use(sinonChai);
    bdd.describe('app/search/GridRowHeader', function () {
        sinon = sinon.sandbox.create();
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        bdd.beforeEach(function () {
            sinon.stub(config, 'getQueryLayerByIndex').returns({
                index: '2',
                legendTitle: 'n/a',
                ENVIROAPPSYMBOL: 'blah'
            });
            widget = new WidgetUnderTest({
                name: 'Scott',
                count: 15,
                color: [1,2,3]
            }, domConstruct.create('div', {}, win.body()));
            widget.startup();
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
            sinon.restore();
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a GridRowHeader', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('postCreate', function () {
            bdd.it('shows custom legend text', function () {
                expect(domClass.contains(widget.customLegendText, 'hidden')).to.not.be.ok;
            });
        });
    });
});
