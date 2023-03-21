define([
    'jquery',

    'app/security/_UserAdminUser',

    'chai-subset',

    'dojo/dom-construct',
    'dojo/query',


    'sinon',

    'sinon-chai'
], function (
    $,

    WidgetUnderTest,

    chaiSubset,

    domConstruct,
    query,

    sinon,

    sinonChai
) {
    const bdd = intern.getInterface('bdd');
    const chai = intern.getPlugin('chai');
    const expect = chai.expect;

    chai.use(chaiSubset);
    chai.use(sinonChai);
    bdd.describe('app/security/_UserAdminUser', function () {
        sinon = sinon.sandbox.create();
        var widget;
        var destroy = function (destroyWidget) {
            destroyWidget.destroyRecursive();
            destroyWidget = null;
        };
        var phone = '801-699-1234';
        var endDate = 1412283976527;

        bdd.beforeEach(function () {
            widget = new WidgetUnderTest({
                first: 'Scott',
                last: 'Davis',
                email: 'stdavis@utah.gov',
                role: 'viewer',
                roles: ['publisher', 'viewer', 'admin'],
                agency: 'AGRC',
                lastLogin: 1412283976527,
                adminToken: 'blah',
                userId: 'asdlfkjasdasdf',
                appName: 'unittests',
                additional: {
                    address: '123 e main',
                    city: 'salt lake city',
                    state: 'Utah',
                    phone: phone,
                    zip: '84124'
                },
                accessRules: {
                    endDate: endDate,
                    options: {
                        // counties: ['BEAVER', 'DAVIS'],
                        locationTxt: 'this is a great description of a location that ' +
                            'leaves absolutely no room for mis-interpretation'
                        // layers: [0, 1]
                    }
                }
            }, domConstruct.create('div', null, document.body));
            widget.startup();
        });

        bdd.afterEach(function () {
            if (widget) {
                destroy(widget);
            }
            sinon.restore();
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a _UserAdminUser', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('getLayers', function () {
            bdd.it('returns the ids of the selected layer checkboxes', function () {
                // hard code some layer checkboxes
                domConstruct.create('input', {
                    type: 'checkbox',
                    value: '1',
                    checked: true
                }, widget.layersContainer);
                domConstruct.create('input', {
                    type: 'checkbox',
                    value: '2',
                    checked: false
                }, widget.layersContainer);
                domConstruct.create('input', {
                    type: 'checkbox',
                    value: '3',
                    checked: true
                }, widget.layersContainer);

                expect(widget.getLayers()).to.deep.equal(['1', '3']);
            });
        });
        bdd.describe('isValid', function () {
            bdd.beforeEach(function () {
                widget.emailTxt.value = 'blah';
            });
            bdd.it('requires geographic region', function () {
                sinon.stub(widget, 'getLayers').returns(['1']);

                expect(widget.isValid()).to.equal(false);

                $(widget.countiesSelect).val('DAVIS');

                expect(widget.isValid()).to.equal(true);
            });
            bdd.it('requires at least one layer', function () {
                $(widget.countiesSelect).val('DAVIS');

                expect(widget.isValid()).to.equal(false);

                sinon.stub(widget, 'getLayers').returns(['1']);

                expect(widget.isValid()).to.equal(true);
            });
            bdd.it('is valid on layers change', function () {
                var widget2 = new WidgetUnderTest({
                    first: 'Scott',
                    last: 'Davis',
                    email: 'stdavis@utah.gov',
                    role: 'viewer',
                    roles: ['publisher', 'viewer', 'admin'],
                    agency: 'AGRC',
                    lastLogin: 1412283976527,
                    adminToken: 'blah',
                    userId: 'asdlfkjasdasdf',
                    appName: 'unittests',
                    additional: {
                        address: '123 e main',
                        city: 'salt lake city',
                        state: 'Utah',
                        phone: '801-699-1234',
                        zip: '84124'
                    },
                    accessRules: {
                        endDate: Date.now(),
                        options: {
                            counties: ['BEAVER', 'DAVIS'],
                            locationTxt: 'this is a great description of a location that ' +
                                'leaves absolutely no room for mis-interpretation',
                            layers: [0, 1]
                        }
                    }
                }, domConstruct.create('div', null, document.body));

                // hard code some layer checkboxes
                domConstruct.create('input', {
                    type: 'checkbox',
                    value: '1',
                    checked: true
                }, widget2.layersContainer);
                domConstruct.create('input', {
                    type: 'checkbox',
                    value: '2',
                    checked: false
                }, widget2.layersContainer);
                domConstruct.create('input', {
                    type: 'checkbox',
                    value: '3',
                    checked: true
                }, widget2.layersContainer);

                query('ul input[type="checkbox"][value="2"]', widget2.domNode)[0].checked = true;

                expect(widget2.isValid()).to.equal(true);

                destroy(widget2);
            });
        });
        bdd.describe('getData', function () {
            bdd.it('includes extra data fields', function () {
                expect(widget.getData().additional).to.containSubset({
                    phone: phone
                });
                expect(widget.getData().accessRules).to.containSubset({
                    options: {
                        counties: null,
                        locationTxt: 'this is a great description of a location that ' +
                            'leaves absolutely no room for mis-interpretation',
                        layers: []
                    }
                });
            });
        });
    });
});
