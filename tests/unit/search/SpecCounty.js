define([
    'app/config',
    'app/search/County',

    'dojo/Deferred',
    'dojo/dom-construct',
    'dojo/_base/window',

    'intern!bdd',

    'intern/chai!',
    'intern/chai!expect',

    'sinon',

    'sinon-chai',

    'tests/helpers/topics'
], function (
    config,
    WidgetUnderTest,

    Deferred,
    domConstruct,
    win,

    bdd,

    chai,
    expect,

    sinon,

    sinonChai,

    topics
) {
    chai.use(sinonChai);
    chai.use(topics.plugin);
    bdd.describe('app/search/County', function () {
        sinon = sinon.sandbox.create();
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        bdd.beforeEach(function () {
            topics.beforeEach();
            widget = new WidgetUnderTest({}, domConstruct.create('div', null, win.body()));
        });

        bdd.afterEach(function () {
            topics.afterEach();
            if (widget) {
                destroy(widget);
            }
            sinon.restore();
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a County', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('onChange', function () {
            bdd.it('searches for counties and state', function () {
                widget.api.search = sinon.stub().returns({then: function () {}});

                widget.select.value = 'STATEWIDE';

                widget.onChange();

                expect(widget.api.search.lastCall.args[0])
                    .to.equal(config.featureClassNames.utah);

                widget.select.value = 'KANE';

                widget.onChange();

                expect(widget.api.search.lastCall.args[0])
                    .to.equal(config.featureClassNames.counties);
            });
            bdd.it('publishes topic with returned geometry', function () {
                topics.listen(config.topics.appMapMapController.zoomToSearchGraphic);
                var def = new Deferred();
                sinon.stub(widget.api, 'search').returns(def.promise);
                var geo = {};

                widget.onChange();

                def.resolve([{geometry: geo}]);

                expect(config.topics.appMapMapController.zoomToSearchGraphic).to.have.been.published();
            });
            bdd.it('shows error message', function () {
                var value = 'error message';
                var def = new Deferred();
                sinon.stub(widget.api, 'search').returns(def.promise);

                widget.onChange();

                def.reject(value);

                expect(widget.errMsg.innerHTML).to.equal(value);
            });
            bdd.it('set\'s geometry prop for later retrieval', function () {
                var def = new Deferred();
                sinon.stub(widget.api, 'search').returns(def.promise);
                var geo = {rings: [1,2]};

                widget.onChange();

                def.resolve([{geometry: geo}]);

                expect(widget.geometry.rings).to.equal(geo.rings);
            });
        });
        bdd.describe('getGeometry', function () {
            bdd.it('returns last zoomed to geometry', function () {
                var geo = {};
                widget.geometry = geo;

                return widget.getGeometry().then(function (g) {
                    expect(g).to.equal(geo);
                });
            });
            bdd.it('generates new geometry if none is defined (eg. clear has been called)', function () {
                widget.clear();

                var def = new Deferred();
                var geo = {};
                sinon.stub(widget.api, 'search').returns(def.promise);

                def.resolve([{geometry: geo}]);

                return widget.getGeometry().then(function (g) {
                    expect(g).not.to.be.null;
                });
            });
        });
        bdd.describe('_onShow', function () {
            bdd.it('grabs state extent on first show', function () {
                sinon.stub(widget.api, 'search', function () {
                    widget.geometry = {};
                    return {then: function () {}};
                });

                widget._onShow();
                widget._onShow();

                expect(widget.api.search).to.have.callCount(1);
            });
        });
        bdd.describe('clear', function () {
            bdd.it('clears the graphic', function () {
                widget.geometry = {};

                topics.listen(config.topics.appMapMapController.clearGraphics);

                widget.clear();

                expect(widget.geometry).to.be.null;
                expect(config.topics.appMapMapController.clearGraphics).to.have.been.published();
            });
            bdd.it('resets the select', function () {
                widget.select.selectedIndex = 1;

                widget.clear();

                expect(widget.select.selectedIndex).to.equal(0);
            });
        });
    });
});
