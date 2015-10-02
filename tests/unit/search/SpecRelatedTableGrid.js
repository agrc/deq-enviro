define([
    'app/config',
    'app/search/RelatedTableGrid',

    'dojo/dom-class',
    'dojo/dom-construct',

    'intern!bdd',

    'intern/chai!',
    'intern/chai!expect',

    'sinon',

    'sinon-chai'
], function (
    config,
    WidgetUnderTest,

    domClass,
    domConstruct,

    bdd,

    chai,
    expect,

    sinon,

    sinonChai
) {
    chai.use(sinonChai);
    bdd.describe('app/search/RelatedTableGrid', function () {
        sinon = sinon.sandbox.create();
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var container;

        bdd.beforeEach(function () {
            container = domConstruct.create('div');
            sinon.stub(config, 'getRelatedTableByIndex').returns({
                fields: [['blah', 'blah']],
                index: 33,
                additionalLink: 'http://blah.com',
                additionalLinkFields: 'MAJ_STDESC, ACKEY'
            });
            widget = new WidgetUnderTest({
                records: [{
                    'attributes': {
                        'OBJECTID': 784,
                        'ACLINK_KEY': 5501,
                        'MAJ_STDESC': 'COC Issued',
                        'PROJ_MANAG': null,
                        'START_DATE': 1413007200000,
                        'COMPL_DATE': 1374537600000,
                        'CURRENT_LD': null,
                        'ACT_COMM': null,
                        'MAJ_FEDDES': null,
                        'ACKEY': 869,
                        'MAJACT_KEY': 13,
                        'GlobalID': '{77F2A2B3-2399-4365-8882-C784A0C83CF8}'
                    }
                }, {
                    'attributes': {
                        'OBJECTID': 435,
                        'ACLINK_KEY': 5501,
                        'MAJ_STDESC': 'COC Requested',
                        'PROJ_MANAG': null,
                        'START_DATE': 1351641600000,
                        'COMPL_DATE': null,
                        'CURRENT_LD': null,
                        'ACT_COMM': 'Closure Decision Report submitted, requested issuance of COC',
                        'MAJ_FEDDES': null,
                        'ACKEY': 462,
                        'MAJACT_KEY': 85,
                        'GlobalID': '{2C0FEA46-EDC4-4604-9AA5-AE1559D021DE}'
                    }
                }],
                tableId: 34,
                pillsDiv: container,
                fields: [{
                    'name': 'PROJ_MANAG',
                    'type': 'esriFieldTypeString',
                    'alias': 'PROJ_MANAG',
                    'length': 50
                }, {
                    'name': 'START_DATE',
                    'type': 'esriFieldTypeDate',
                    'alias': 'START_DATE',
                    'length': 8
                }, {
                    'name': 'COMPL_DATE',
                    'type': 'esriFieldTypeDate',
                    'alias': 'COMPL_DATE',
                    'length': 8
                }],
                fiveFields: {
                    ID: 3,
                    NAME: 'name',
                    TYPE: 'type',
                    ADDRESS: 'address',
                    CITY: 'city'
                }
            }, domConstruct.create('div', null, document.body));
        });

        bdd.afterEach(function () {
            domConstruct.destroy(widget.pillsDiv);
            if (widget) {
                destroy(widget);
            }
            sinon.restore();
        });

        bdd.describe('Sanity', function () {
            bdd.it('should create a RelatedTableGrid', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('createPill', function () {
            bdd.beforeEach(function () {
                domConstruct.empty(container);
            });
            bdd.it('creates a li element', function () {
                widget.createPill(container, 'blah');

                expect(container.children.length).to.equal(1);
                expect(domClass.contains(container.children[0], 'active')).to.equal(true);
            });
            bdd.it('assigns the active class only if it\'s the first one', function () {
                domConstruct.create('li', null, container);

                widget.createPill(container, 'blah');

                expect(domClass.contains(container.children[1], 'active')).to.equal(false);
            });
        });
        bdd.describe('formatData', function () {
            bdd.it('adds additional info field', function () {
                expect(widget.records[0].attributes.additionalInfo)
                    .to.equal('http://blah.com?ID=3&NAME=name&TYPE=type&ADDRESS=address&CITY=city&' +
                        'MAJ_STDESC=COC%20Issued&ACKEY=869');
            });
            bdd.it('supports addition info field links with existing query parameters', function () {
                var container2 = domConstruct.create('div');
                // config.getRelatedTableByIndex.and.stub();
                config.getRelatedTableByIndex.returns({
                    fields: [['blah', 'blah']],
                    index: 33,
                    additionalLink: 'http://blah.com?prop=value',
                    additionalLinkFields: 'MAJ_STDESC, ACKEY'
                });
                var widget2 = new WidgetUnderTest({
                    records: [{
                        'attributes': {
                            'OBJECTID': 784,
                            'ACLINK_KEY': 5501,
                            'MAJ_STDESC': 'COC Issued',
                            'PROJ_MANAG': null,
                            'START_DATE': 1413007200000,
                            'COMPL_DATE': 1374537600000,
                            'CURRENT_LD': null,
                            'ACT_COMM': null,
                            'MAJ_FEDDES': null,
                            'ACKEY': 869,
                            'MAJACT_KEY': 13,
                            'GlobalID': '{77F2A2B3-2399-4365-8882-C784A0C83CF8}'
                        }
                    }, {
                        'attributes': {
                            'OBJECTID': 435,
                            'ACLINK_KEY': 5501,
                            'MAJ_STDESC': 'COC Requested',
                            'PROJ_MANAG': null,
                            'START_DATE': 1351641600000,
                            'COMPL_DATE': null,
                            'CURRENT_LD': null,
                            'ACT_COMM': 'Closure Decision Report submitted, requested issuance of COC',
                            'MAJ_FEDDES': null,
                            'ACKEY': 462,
                            'MAJACT_KEY': 85,
                            'GlobalID': '{2C0FEA46-EDC4-4604-9AA5-AE1559D021DE}'
                        }
                    }],
                    tableId: 34,
                    pillsDiv: container2,
                    fields: [{
                        'name': 'PROJ_MANAG',
                        'type': 'esriFieldTypeString',
                        'alias': 'PROJ_MANAG',
                        'length': 50
                    }, {
                        'name': 'START_DATE',
                        'type': 'esriFieldTypeDate',
                        'alias': 'START_DATE',
                        'length': 8
                    }, {
                        'name': 'COMPL_DATE',
                        'type': 'esriFieldTypeDate',
                        'alias': 'COMPL_DATE',
                        'length': 8
                    }],
                    fiveFields: {
                        ID: 3,
                        NAME: 'name',
                        TYPE: 'type',
                        ADDRESS: 'address',
                        CITY: 'city'
                    }
                }, domConstruct.create('div', null, document.body));

                expect(widget2.records[0].attributes.additionalInfo)
                    .to.equal('http://blah.com?prop=value&ID=3&NAME=name&TYPE=type&ADDRESS=address&CITY=city&' +
                        'MAJ_STDESC=COC%20Issued&ACKEY=869');

                destroy(widget2);
            });
        });
    });
});
