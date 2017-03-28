define([
    'app/config',
    'app/map/ReferenceLayerToggle',

    'dojo/dom-construct',
    'dojo/topic',
    'dojo/_base/window',

    'esri/layers/ArcGISDynamicMapServiceLayer',

    'intern!bdd',

    'intern/chai!',
    'intern/chai!expect',

    'sinon',

    'sinon-chai',

    'tests/helpers/topics'
], function (
    config,
    WidgetUnderTest,

    domConstruct,
    topic,
    win,

    ArcGISDynamicMapServiceLayer,

    bdd,

    chai,
    expect,

    sinon,

    sinonChai,

    topicsHelper
) {
    chai.use(topicsHelper.plugin);
    chai.use(sinonChai);
    var url = '/arcgis/rest/services/Wildlife/Data/MapServer';
    var index = 3;
    var destroy = function (widget) {
        widget.destroyRecursive();
        widget = null;
    };
    var topics = config.topics.appMapReferenceLayerToggle;

    bdd.describe('app/map/ReferenceLayerToggle', function () {
        var widget;
        bdd.beforeEach(function () {
            topicsHelper.beforeEach();
            topicsHelper.listen(topics.addLayer);
            topicsHelper.listen(topics.toggleLayer);

            widget = new WidgetUnderTest({
                layerName: 'blah',
                mapServiceUrl: url,
                layerIndex: index,
                layerClass: ArcGISDynamicMapServiceLayer
            }, domConstruct.create('div', null, win.body()));
        });

        bdd.afterEach(function () {
            topicsHelper.afterEach();
            if (widget) {
                destroy(widget);
            }
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a ReferenceLayerToggle', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('postCreate', () => {
            bdd.it('checks box and calls on change when topic fires', () => {
                sinon.stub(widget, 'onCheckboxChange');
                widget.checkbox.checked = false;
                widget.mapServiceUrl = config.urls.DEQEnviro;
                widget.layerIndex = config.layerIndices.streams;

                topic.publish(config.topics.appSearch.onStreamSelect);

                expect(widget.checkbox.checked).to.be.true;
                expect(widget.onCheckboxChange).to.have.been.called;
            });
        });
        bdd.describe('onCheckboxChange', function () {
            bdd.it('publishes the appropriate toggleLayer topic', function () {
                widget.checkbox.checked = true;
                widget.onCheckboxChange();

                expect(topics.addLayer).to.have.been.publishedWith(url, ArcGISDynamicMapServiceLayer, index);
                expect(topics.toggleLayer).to.have.been.publishedWith(url, index, true);
            });
        });
    });
});
