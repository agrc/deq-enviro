define([
    'app/config',

    'dojo/Deferred',
    'dojo/text!tests/unit/data/DEQEnviro.json',

    'intern!bdd',

    'intern/chai!expect',

    'stubmodule'
], function (
    config,

    Deferred,
    DEQEnviroJSON,

    bdd,

    expect,

    stubmodule
) {
    bdd.describe('app/config', function () {
        var StubbedModule;
        bdd.beforeEach(function () {
            var def = new Deferred();
            stubmodule('app/config', {
                'dojo/request': function () {
                    return def;
                }
            }).then(function (newModule) {
                StubbedModule = newModule;
                def.resolve(JSON.parse(DEQEnviroJSON));
                return StubbedModule.getAppJson();
            });
            return def.promise;
        });
        bdd.it('generates a query layer name lookup object', function () {
            expect(StubbedModule.queryLayerNames['11']).to.equal('Large Industrial Source Emissions');
        });
        bdd.describe('getQueryLayerByIndex', function () {
            bdd.it('returns the correct layer', function () {
                expect(StubbedModule.getQueryLayerByIndex('11').NAME).to.equal('Company');
            });
        });
    });
});
