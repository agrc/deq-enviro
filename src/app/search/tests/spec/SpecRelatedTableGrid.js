require([
    'app/search/RelatedTableGrid',
    'app/config',

    'dojo/dom-construct',
    'dojo/dom-class'
], function(
    WidgetUnderTest,
    config,

    domConstruct,
    domClass
) {
    describe('app/search/RelatedTableGrid', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var container;

        beforeEach(function() {
            container = domConstruct.create('div');
            spyOn(config, 'getRelatedTableByIndex').and.returnValue({
                fields: [['blah', 'blah']],
                index: 33
            });
            widget = new WidgetUnderTest({
                records: [{
                    'attributes': {
                        'OBJECTID': 784,
                        'ACLINK_KEY': 5501,
                        'MAJ_STDESC': 'COC Issued',
                        'PROJ_MANAG': null,
                        'START_DATE': 1374537600000,
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
                }]
            }, domConstruct.create('div', null, document.body));
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a RelatedTableGrid', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('createPill', function () {
            beforeEach(function () {
                domConstruct.empty(container);
            });
            it('creates a li element', function () {
                widget.createPill(container, 'blah');

                expect(container.children.length).toBe(1);
                expect(domClass.contains(container.children[0], 'active')).toBe(true);
            });
            it('assigns the active class only if it\'s the first one', function () {
                domConstruct.create('li', null, container);

                widget.createPill(container, 'blah');

                expect(domClass.contains(container.children[1], 'active')).toBe(false);
            });
        });
        describe('formatData', function () {
            it('converts dates to strings', function () {
                var results = widget.formatData(widget.records);

                expect(results[0].START_DATE).toEqual('7/22/2013');
            });
        });
    });
});
