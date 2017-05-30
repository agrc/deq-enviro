define([
    'app/config',
    'app/security/_RequestPane',

    'chai-subset',

    'dojo/Deferred',
    'dojo/dom-construct',
    'dojo/query',

    'intern!bdd',

    'intern/chai!',
    'intern/chai!expect',

    'sinon',

    'sinon-chai'
], function (
    config,
    WidgetUnderTest,

    chaiSubset,

    Deferred,
    domConstruct,
    query,

    bdd,

    chai,
    expect,

    sinon,

    sinonChai
) {
    chai.use(sinonChai);
    chai.use(chaiSubset);
    bdd.describe('app/security/_RequestPane', function () {
        sinon = sinon.sandbox.create();
        var widget;
        var destroy = function (destroyWidget) {
            destroyWidget.destroyRecursive();
            destroyWidget = null;
        };

        bdd.beforeEach(function () {
            var def = new Deferred();
            sinon.stub(config, 'getAppJson').returns(def);
            def.resolve({
                queryLayers: [{
                    secure: 'No'
                }, {
                    secure: 'Yes',
                    name: 'Layer Name',
                    index: 1
                }, {
                    secure: 'Yes',
                    name: 'Layer Name Two',
                    index: 2
                }]
            });
            widget = new WidgetUnderTest({
                parentWidget: {
                    goToPane: function () {}
                }
            }, domConstruct.create('div', null, document.body));
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
            sinon.restore();
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a _RequestPane', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('postCreat', function () {
            bdd.it('should create the layer checkboxes', function () {
                const numLayers = 2;
                expect(widget.layersContainer.children.length).to.equal(numLayers);

                var lyr = widget.layersContainer.children[0];

                expect(lyr.children[0].children[0].value).to.equal('1');
                expect(lyr.children[0].children[1].innerHTML).to.equal('Layer Name');
            });
        });
        bdd.describe('validate', function () {
            bdd.it('requires all fields', function () {
                widget.fNameTxt.value = 'test';
                widget.lNameTxt.value = 'test';
                widget.agencyTxt.value = 'test';
                widget.addressTxt.value = 'test';
                widget.cityTxt.value = 'test';
                widget.stateTxt.value = 'test';
                widget.phoneTxt.value = 'test';
                widget.zipTxt.value = 'test';
                widget.emailTxt.value = 'test@test.com';
                widget.emailConfirmTxt.value = 'test@test.com';
                widget.passwordTxt.value = 'pass';
                widget.passwordConfirmTxt.value = 'pass';

                expect(widget.validate({})).to.equal(false);

                widget.timeSelect.value = '3';

                expect(widget.validate({})).to.equal(false);

                query('input', widget.layersContainer)[0].checked = true;

                expect(widget.validate({})).to.equal(false);

                widget.locationTxt.value = 'blah';

                expect(widget.validate({})).to.equal(true);
            });
        });
        bdd.describe('getData', function () {
            bdd.it('get\'s extra fields', function () {
                widget.fNameTxt.value = 'first';
                widget.lNameTxt.value = 'last';
                widget.agencyTxt.value = 'agency';
                widget.addressTxt.value = 'address';
                widget.cityTxt.value = 'city';
                widget.stateTxt.value = 'state';
                widget.phoneTxt.value = 'phone';
                widget.zipTxt.value = 'zip';
                widget.emailTxt.value = 'test@test.com';
                widget.emailConfirmTxt.value = 'test@test.com';
                widget.passwordTxt.value = 'pass';
                widget.passwordConfirmTxt.value = 'pass';
                query('input', widget.layersContainer)[0].checked = true;
                query('input', widget.layersContainer)[1].checked = true;
                widget.locationTxt.value = 'blah';
                widget.timeSelect.value = '3';

                expect(widget.getData().additional).to.deep.equal({
                    address: 'address',
                    city: 'city',
                    state: 'state',
                    phone: 'phone',
                    zip: 'zip'
                });
                expect(widget.getData().accessRules).to.containSubset({
                        // startDate: 1412891655130,
                        // endDate: 1420844055130,
                    options: {
                        layers: ['1', '2'],
                        locationTxt: 'blah'
                    }
                });
                expect(widget.getData()).to.containSubset({
                    first: 'first',
                    last: 'last',
                    agency: 'agency',
                    email: 'test@test.com',
                    password: 'pass'
                });
            });
        });
    });
});
