require([
    'app/config',

    'stubmodule',

    'dojo/text!src/app/tests/data/DEQEnviro.json',

    'dojo/Deferred'

],

function (
    config,

    stubmodule,

    DEQEnviroJSON,

    Deferred
    ) {
    describe('app/config', function () {
        var StubbedModule;
        beforeEach(function (done) {
            var def = new Deferred();
            stubmodule('app/config', {
                'dojo/request': function () {
                    return def;
                }
            }).then(function (newModule) {
                StubbedModule = newModule;
                StubbedModule.getAppJson().then(function () {
                    done();
                });
                def.resolve(JSON.parse(DEQEnviroJSON));
            });
        });
        it('generates a query layer name lookup object', function () {
            expect(StubbedModule.queryLayerNames['6']).toEqual('Large Industrial Source Emissions');
        });
        describe('getQueryLayerByIndex', function () {
            it('returns the correct layer', function () {
                expect(StubbedModule.getQueryLayerByIndex('6').NAME).toBe('Company');
            });
        });
    });
});