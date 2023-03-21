/* eslint-disable no-unused-expressions, no-magic-numbers */
define([
    'app/config',
    'app/search/IdentifyPane',

    'dojo/dom-class',
    'dojo/dom-construct',

    'sinon',

    'sinon-chai'
], function (
    config,
    WidgetUnderTest,

    domClass,
    domConstruct,

    sinon,

    sinonChai
) {
    const bdd = intern.getInterface('bdd');
    const chai = intern.getPlugin('chai');
    const expect = chai.expect;

    chai.use(sinonChai);
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


    bdd.describe('app/search/IdentifyPane', function () {
        sinon = sinon.sandbox.create();
        bdd.beforeEach(function () {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, document.body));
        });
        bdd.afterEach(function () {
            if (widget) {
                widget.destroyRecursive();
                widget = null;
            }
            sinon.restore();
        });
        bdd.describe('Sanity', function () {
            bdd.it('should create a IdentifyPane', function () {
                expect(widget).to.be.instanceOf(WidgetUnderTest);
            });
        });
        bdd.describe('getStoreData', function () {
            bdd.it('tears out attributes and matches with fields', function () {
                var results = widget.getStoreData(atts, fields);

                expect(results.length).to.equal(19);
                expect(results[0]).to.deep.equal({
                    fieldAlias: 'DERR ID',
                    value: 'J08UT0811'
                });
                expect(results[results.length - 1]).to.deep.equal({
                    fieldAlias: 'Archived for Cerclis',
                    value: 'No'
                });
            });
        });
        bdd.describe('updateLinks', function () {
            var item = {
                parent: '14',
                ID: 'id',
                NAME: 'name',
                ADDRESS: 'address',
                CITY: 'city',
                TYPE: 'type'
            };
            bdd.it('formats links', function () {
                sinon.stub(config, 'getQueryLayerByIndex').returns({
                    docLink: 'http://168.178.6.35/DDW/DdwWSFacDocSearch.htm',
                    gramaLink: 'http://168.178.6.35/DDW/DdwWSFacGRAMA.htm',
                    permitLink: 'blah',
                    additionalLink: 'http://168.178.6.35/DDW/DdwWSFacAddInfor.htm'
                });

                widget.updateLinks(item);

                expect(widget.docLink.href).to.equal(
                    'http://168.178.6.35/DDW/DdwWSFacDocSearch.htm?ID=id&NAME=name&ADDRESS=address&CITY=city&TYPE=type'
                );
            });
            bdd.it('hides empty links', function () {
                var ql = {
                    docLink: '',
                    gramaLink: 'http://168.178.6.35/DDW/DdwWSFacGRAMA.htm',
                    permitLink: 'blah',
                    additionalLink: 'http://168.178.6.35/DDW/DdwWSFacAddInfor.htm'
                };
                sinon.stub(config, 'getQueryLayerByIndex').returns(ql);

                widget.updateLinks(item);

                expect(domClass.contains(widget.docLink, 'hidden')).to.equal(true);

                ql.docLink = 'blah';

                widget.updateLinks(item);

                expect(domClass.contains(widget.docLink), 'hidden').to.equal(false);
            });
            bdd.it('supports links with existing query parameters', function () {
                sinon.stub(config, 'getQueryLayerByIndex').returns({
                    docLink: 'http://168.178.6.35/DDW/DdwWSFacDocSearch.htm?example=someVal',
                    gramaLink: 'http://168.178.6.35/DDW/DdwWSFacGRAMA.htm',
                    permitLink: 'blah',
                    additionalLink: 'http://168.178.6.35/DDW/DdwWSFacAddInfor.htm'
                });

                widget.updateLinks(item);

                expect(widget.docLink.href).to.equal(
                    'http://168.178.6.35/DDW/DdwWSFacDocSearch.htm?example=someVal' +
                    '&ID=id&NAME=name&ADDRESS=address&CITY=city&TYPE=type'
                );
            });
        });
    });
});
