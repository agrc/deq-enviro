/* eslint-disable no-unused-expressions, no-magic-numbers */
define([
    'app/config',
    'app/search/ResultLayer',

    'dojo/text!tests/unit/search/data/featureSet.json',
    'dojo/topic',

    'intern!bdd',

    'intern/chai!',
    'intern/chai!expect',

    'tests/helpers/topics',

    'sinon',

    'sinon-chai'
], function (
    config,
    ClassUnderTest,

    fSet,
    topic,

    bdd,

    chai,
    expect,

    topics,

    sinon,

    sinonChai
) {
    chai.use(sinonChai);
    chai.use(topics.plugin);
    bdd.describe('app/search/ResultLayer', function () {
        sinon = sinon.sandbox.create();
        var testObject;
        var queryLayer = {
            color: [255, 255, 255, 0],
            sortField: 'n/a',
            index: '1'
        };
        var layerIndex = '14';

        bdd.beforeEach(function () {
            topics.beforeEach();
            sinon.stub(config, 'getQueryLayerByIndex').returns(queryLayer);
            testObject = new ClassUnderTest([1, 2, 3], [1, 2, 3], 'point', layerIndex);
            topics.listen(config.topics.appResultLayer.identifyFeature);
        });

        bdd.afterEach(function () {
            topics.afterEach();
            testObject = null;
            sinon.restore();
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a ResultLayer', function () {
                expect(testObject).to.be.instanceOf(ClassUnderTest);
            });
            bdd.it('show subscribe to the search start and destroy itself', function () {
                sinon.spy(testObject, 'destroy');

                topic.publish(config.topics.appSearch.searchStarted);

                expect(testObject.destroy).to.have.been.called;
            });
        });
        bdd.describe('onClick', function () {
            bdd.it('passes the appropriate data to the topic', function () {
                var oid = 123;
                var g = {
                    attributes: { OBJECTID: oid }
                };
                var spy = sinon.spy();
                testObject.onClick({ graphic: g,
                    stopPropagation: spy });

                expect(config.topics.appResultLayer.identifyFeature).to.have.been.publishedWith(oid, layerIndex);
                expect(spy).to.have.been.called;
            });
        });
    });
});
