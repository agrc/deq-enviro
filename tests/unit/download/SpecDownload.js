define([
    'app/config',
    'app/download/Download',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/topic',

    'intern!bdd',

    'intern/chai!',
    'intern/chai!expect',

    'sinon',

    'sinon-chai',

    'stubmodule'
], function (
    config,
    WidgetUnderTest,

    domClass,
    domConstruct,
    topic,

    bdd,

    chai,
    expect,

    sinon,

    sinonChai,

    stubmodule
) {
    chai.use(sinonChai);
    bdd.describe('app/download/Download', function () {
        sinon = sinon.sandbox.create();
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        bdd.beforeEach(function () {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, document.body));
            sinon.restore();
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a Download', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });

        bdd.describe('update count after topic fires', function () {
            bdd.describe('multiple program results', function () {
                bdd.it('displays the correct count of results', function () {
                    var response = {
                        'result': {
                            '5': [{}, {}, {}, {}, {}],
                            '6': [{}, {}, {}, {}, {}, {}]
                        }
                    };

                    topic.publish(config.topics.appSearchResultsGrid.downloadFeaturesDefined, response.result);

                    expect(widget.get('count')).to.equal('11');
                });
                bdd.it('displays 0', function () {
                    var response = {
                        'result': {
                            '5': [],
                            '6': []
                        }
                    };

                    topic.publish(config.topics.appSearchResultsGrid.downloadFeaturesDefined, response.result);
                    expect(widget.get('count')).to.equal('0');
                });
                bdd.it('can adds commas', function () {
                    var a = [];
                    a.length = 1000;
                    widget.updateCount({'test': a});

                    expect(widget.get('count')).to.equal('1,000');
                });
            });
        });
        bdd.describe('Visibility of widget', function () {
            bdd.it('widget should be hidden when there are no results', function () {
                var response = {
                    'result': {
                        '5': [],
                        '6': []
                    }
                };

                topic.publish(config.topics.appSearchResultsGrid.downloadFeaturesDefined, response.result);

                expect(domClass.contains(widget.domNode, 'hidden')).to.equal(true);
                expect(domClass.contains(widget.domNode, 'show')).to.equal(false);
            });
            bdd.it('widget should be visible when there are results', function () {
                var response = {
                    'result': {
                        '5': [{}],
                        '6': []
                    }
                };

                topic.publish(config.topics.appSearchResultsGrid.downloadFeaturesDefined, response.result);

                expect(domClass.contains(widget.domNode, 'show')).to.equal(true);
                expect(domClass.contains(widget.domNode, 'hidden')).to.equal(false);
            });
            bdd.it('can handle commas', function () {
                widget.updateVisibility('1,000');

                expect(domClass.contains(widget.domNode, 'show')).to.equal(true);
                expect(domClass.contains(widget.domNode, 'hidden')).to.equal(false);
            });
        });
        bdd.describe('download', function () {
            bdd.it('show\'s error message if no format is selected', function () {
                sinon.spy(widget, 'showErrMsg');
                widget.download();

                expect(widget.showErrMsg).to.have.been.calledWith(widget.noFormatMsg);
            });
            bdd.it('sends the proper parameters to the gp tool', function () {
                return stubmodule('app/download/Download', {
                    'app/map/MapController': {map: {showLoader: function () {}}}
                }).then(function (StubbedModule) {
                    var testWidget2 = new StubbedModule({}, domConstruct.create('div', {}, document.body));
                    var type = 'xls';
                    testWidget2.fileTypes.value = type;
                    var idMap = {};
                    testWidget2.downloadFeatures = idMap;
                    expect(testWidget2.download()).to.deep.equal({
                        'table_id_map': '{}',
                        'file_type': type,
                        'location': config.downloadDataPath
                    });
                    destroy(testWidget2);
                });
            });
        });
    });
});
