define([
    'jquery',
    'app/config',
    'app/search/QueryLayer',

    'dojo/dom-attr',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/_base/window',

    'intern!bdd',

    'intern/chai!',
    'intern/chai!expect',

    'sinon',

    'sinon-chai',

    'tests/helpers/topics'
], function (
    $,
    config,
    WidgetUnderTest,

    domAttr,
    domClass,
    domConstruct,
    win,

    bdd,

    chai,
    expect,

    sinon,

    sinonChai,

    topics
) {
    chai.use(topics.plugin);
    chai.use(sinonChai);
    bdd.describe('app/search/QueryLayer', function () {
        sinon = sinon.sandbox.create();
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var index = '0';
        var topicNames = config.topics.appQueryLayer;

        bdd.beforeEach(function () {
            localStorage.clear();
            topics.beforeEach();
            topics.listen(topicNames.addLayer);
            topics.listen(topicNames.removeLayer);
            widget = new WidgetUnderTest({
                layerName: 'blah',
                index: index,
                metaDataUrl: 'blah',
                description: 'hello',
                additionalSearches: 'n/a'
            }, domConstruct.create('div', null, win.body()));
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
            sinon.restore();
            topics.afterEach();
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a QueryLayer', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('postCreate', function () {
            bdd.it('parses additional searches correctly', function () {
                var widget2 = new WidgetUnderTest({
                    layerName: 'blah',
                    index: index,
                    metaDataUrl: 'blah',
                    description: 'hello',
                    additionalSearches: 'COMPANY_NAME|text (Operator Name), ' +
                        'FIELD_NUM|number (Field Number), FIELD_NAME|text (Field Name)'
                }, domConstruct.create('div', null, win.body()));

                expect(widget2.additionalSearchObjects.length).to.equal(3);
                expect(widget2.additionalSearchObjects[0]).to.deep.equal({
                    fieldName: 'COMPANY_NAME',
                    fieldType: 'text',
                    fieldAlias: 'Operator Name'
                });

                destroy(widget2);
            });
        });
        bdd.describe('onCheckboxChange', function () {
            bdd.describe('fires the appropriate topics', function () {
                bdd.it('checked', function () {
                    widget.checkbox.checked = true;

                    widget.onCheckboxChange();

                    expect(topicNames.addLayer).to.have.been.publishedWith(widget);
                    expect(topicNames.removeLayer).not.to.have.been.published();
                });
                bdd.it('unchecked', function () {
                    widget.checkbox.checked = false;

                    widget.onCheckboxChange();

                    expect(topicNames.removeLayer).to.have.been.publishedWith(widget);
                    expect(topicNames.addLayer).not.to.have.been.published();
                });
            });
        });
        bdd.describe('toJson', function () {
            var defQuery;
            bdd.beforeEach(function () {
                defQuery = 'hello';
                widget.defQuery = defQuery;
            });
            bdd.it('returns the correct object', function () {
                expect(widget.toJson()).to.deep.equal({id: index, defQuery: defQuery});
            });
            bdd.it('removes the s for secured layers', function () {
                widget.secure = 'Yes';
                widget.index = 's1';

                expect(widget.toJson()).to.deep.equal({id: '1', defQuery: defQuery});
            });
        });
        bdd.describe('stores checked state in localStorage', function () {
            bdd.it('writes checked state to local storage', function () {
                widget.checkbox.checked = true;
                widget.onCheckboxChange();

                expect(localStorage[widget.localStorageID]).to.equal('true');

                widget.checkbox.checked = false;
                widget.onCheckboxChange();

                expect(localStorage[widget.localStorageID]).to.equal('false');
            });
            bdd.it('sets the checked property and calls onCheckboxChange if checked', function () {
                localStorage[widget.localStorageID] = false;

                destroy(widget);
                widget = new WidgetUnderTest({
                    layerName: 'blah',
                    index: index,
                    metaDataUrl: 'blah',
                    description: 'hello',
                    additionalSearches: 'n/a'
                }, domConstruct.create('div', null, win.body()));

                expect(widget.checkbox.checked).to.equal(false);
                expect(topicNames.addLayer).not.to.have.been.published();

                localStorage[widget.localStorageID] = true;

                destroy(widget);
                widget = new WidgetUnderTest({
                    layerName: 'blah',
                    index: index,
                    metaDataUrl: 'blah',
                    description: 'hello',
                    additionalSearches: 'n/a'
                }, domConstruct.create('div', null, win.body()));

                expect(widget.checkbox.checked).to.equal(true);
                expect(topicNames.addLayer).to.have.been.published();
            });
        });
        bdd.describe('toggleDisabledState', function () {
            bdd.it('sets the appropriate disabled dom properties', function () {
                widget.toggleDisabledState(true);

                expect(domClass.contains(widget.domNode, 'disabled')).to.equal(true);
                expect(domAttr.get(widget.checkbox, 'disabled')).to.equal(true);
            });
        });
        bdd.describe('checkSecurity', function () {
            bdd.it('checks against the layers prop', function () {
                sinon.spy(widget, 'toggleDisabledState');

                var user = {
                    accessRules: {
                        options: {
                            layers: [0]
                        }
                    }
                };
                widget.checkSecurity(user);

                expect(widget.toggleDisabledState).to.have.been.calledWith(false);

                user.accessRules.options.layers = [1, 3];
                widget.checkSecurity(user);

                expect(widget.toggleDisabledState.lastCall.args[0]).to.equal(true);
            });
        });
    });
});
