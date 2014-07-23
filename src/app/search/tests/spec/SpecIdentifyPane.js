require([
    'app/search/IdentifyPane',

    'dojo/dom-construct'
], function(
    WidgetUnderTest,

    domConstruct
) {

    var widget;
    var atts = {
        ADDRESS: 'THE CITY OF GOLD HILL',
        ARCHIVED: 'No',
        CIMID: '490000015491',
        CITY: 'WENDOVER',
        CONPHONE: '8015364164',
        CURRPROJMA: '[Rik Ombach]',
        DERRID: 'J08UT0811',
        EASTING: 264368.029,
        ERB_: 'No',
        GlobalID: '{AFE571FA-4AB6-4FCF-A36C-EF44921096F2}',
        ID: 'J08UT0811',
        MAPLABEL: 'Formerly Used Defense Site - J08UT0811',
        NAME: 'GOLD HILL INSTRUMENT ANNEX',
        NORTHING: 4449224.779,
        NPL_: 'No',
        OBJECTID: 3,
        PROJDESC: null,
        PROPOSDNPL: 'No',
        SITEADDRES: 'THE CITY OF GOLD HILL',
        SITECITY: 'WENDOVER',
        SITECNTY: 'TOOELE',
        SITEDESC: 'Formerly Used Defense Site',
        SITENAME: 'GOLD HILL INSTRUMENT ANNEX',
        STATE: 'UT',
        ST_KEY: 5409,
        TYPE: 'Formerly Used Defense Site - J08UT0811',
        ZIP4: null,
        ZIPCODE: '84083'
    };
    var fields = [
        ['DERRID', 'DERR ID'],
        ['CIMID', 'CIM ID'],
        ['SITEDESC', 'Site Program Description'],
        ['SITENAME', 'Site Name'],
        ['SITEADDRES', 'Site Address'],
        ['SITECITY', 'Site City'],
        ['SITECNTY', 'Site County'],
        ['STATE', 'State'],
        ['ZIPCODE', 'Zip Code'],
        ['ZIP4', 'Zip + 4'],
        ['PROJDESC', 'Project Description'],
        ['CURRPROJMA', 'Current Project Manager'],
        ['CONPHONE', 'Contact Phone Number'],
        ['NORTHING', 'UTM Northing'],
        ['EASTING', 'UTM Easting'],
        ['ERB_', 'Emergency Response Branch'],
        ['NPL_', 'National Priorities List'],
        ['PROPOSDNPL', 'Proposed for NPL'],
        ['ARCHIVED', 'Archived for Cerclis']
    ];

    beforeEach(function() {
        widget = new WidgetUnderTest(null, domConstruct.create('div', null, document.body));
    });
    afterEach(function() {
        if (widget) {
            widget.destroyRecursive();
            widget = null;
        }
    });

    describe('app/search/IdentifyPane', function() {
        describe('Sanity', function() {
            it('should create a IdentifyPane', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('getStoreData', function () {
            it('tears out attributes and matches with fields', function () {
                var results = widget.getStoreData(atts, fields);

                expect(results.length).toBe(19);
                expect(results[0]).toEqual({
                    fieldAlias: 'DERR ID',
                    value: 'J08UT0811'
                });
                expect(results[results.length - 1]).toEqual({
                    fieldAlias: 'Archived for Cerclis',
                    value: 'No'
                });
            });
        });
    });
});