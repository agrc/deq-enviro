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
        it('generates a query layer name lookup object', function (done) {
            var def = new Deferred();
            stubmodule('app/config', {
                'dojo/request': function () {
                    return def;
                }
            }).then(function (StubbedModule) {
                StubbedModule.getAppJson().then(function () {
                    expect(StubbedModule.queryLayerNames['6']).toEqual('Large Industrial Source Emissions');
                    done();
                });
                def.resolve(JSON.parse(DEQEnviroJSON));
            });
        });
    });
});