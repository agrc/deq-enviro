define([
    'app/config',

    'dojo/Deferred',
    'dojo/text!tests/unit/data/DEQEnviro.json',

    'stubmodule'
], function (
    config,

    Deferred,
    DEQEnviroJSON,

    stubmodule
) {
    const bdd = intern.getInterface('bdd');
    const expect = intern.getPlugin('chai').expect;

    bdd.describe('app/config', function () {
        var StubbedModule;
        bdd.beforeEach(function () {
            var def = new Deferred();
            stubmodule('app/config', {
                'dojo/request/xhr': function () {
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
