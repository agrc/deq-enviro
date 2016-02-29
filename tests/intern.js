define({
    proxyPort: 9000,
    proxyUrl: 'http://localhost:9001/',
    capabilities: {
        'selenium-version': '2.48.0'
    },
    environments: [
        { browserName: 'chrome' }
        // { browserName: 'safari' }
    ],
    environmentRetries: 10,
    maxConcurrency: 5,
    tunnel: 'SauceLabsTunnel',
    loaderOptions: {
        packages: [
            { name: 'agrc', location: 'src/agrc'},
            { name: 'app', location: 'src/app'},
            { name: 'dijit', location: 'src/dijit'},
            { name: 'dojo', location: 'src/dojo'},
            { name: 'dojox', location: 'src/dojox'},
            { name: 'esri', location: 'src/esri'},
            { name: 'ijit', location: 'src/ijit'},
            { name: 'layer-selector', location: 'src/layer-selector'},
            {
                name: 'jquery',
                location: 'src/jquery/dist',
                main: 'jquery'
            },{
                name: 'bootstrap',
                location: 'src/bootstrap',
                main: 'dist/js/bootstrap'
            },{
                name: 'spin',
                location: 'src/spinjs',
                main: 'spin'
            },
            { name: 'dgrid', location: 'src/dgrid' },
            { name: 'put-selector', location: 'src/put-selector' },
            { name: 'xstyle', location: 'src/xstyle' },
            {
                name: 'lodash',
                location: 'src/lodash',
                main: 'dist/lodash'
            },{
                name: 'ladda',
                location: 'src/ladda-bootstrap',
                main: 'dist/ladda'
            },{
                name: 'datepicker',
                location: 'src/bootstrap-datepicker',
                main: 'js/bootstrap-datepicker'
            },{
                name: 'selectpicker',
                location: 'src/bootstrap-select',
                main: 'dist/js/bootstrap-select'
            },

            // packages specific to testing
            {
                name: 'stubmodule',
                location: 'src/stubmodule/src',
                main: 'stub-module'
            },{
                name: 'sinon-chai',
                location: 'node_modules/sinon-chai/lib',
                main: 'sinon-chai'
            }, {
                name: 'sinon',
                location: 'node_modules/sinon/lib',
                main: 'sinon'
            }, {
                name: 'chai-subset',
                location: 'node_modules/signavio-chai-subset/lib',
                main: 'chai-subset'
            }
        ],
        map: {
            'ijit': {
                'ijit/widgets/authentication/_LoginRegisterRequestPane':
                    'app/security/_RequestPane',
                'ijit/widgets/authentication/_UserAdminUser':
                    'app/security/_UserAdminUser',
                'ijit/widgets/authentication/_UserAdminPendingUser':
                    'app/security/_UserAdminPendingUser'
            }
        },
        has: {
            'dojo-undef-api': true
        }
    },

    // only run code coverage on app package
    excludeInstrumentation: /^(?!src\/app).*\//
});
