(function () {
    // the baseUrl is relavant in source version and while running unit tests.
    // the`typeof` is for when this file is passed as a require argument to the build system
    // since it runs on node, it doesn't have a window object. The basePath for the build system
    // is defined in build.profile.js
    var config = {
        baseUrl: (
            typeof window !== 'undefined' &&
            window.dojoConfig &&
            window.dojoConfig.isJasmineTestRunner
            ) ? '/src' : './',
        packages: [
            'agrc',
            'app',
            'dijit',
            'dojo',
            'dojox',
            'esri',
            'ijit',
            {
                name: 'jquery',
                location: './jquery/dist',
                main: 'jquery'
            },{
                name: 'bootstrap',
                location: './bootstrap',
                main: 'dist/js/bootstrap'
            },{
                name: 'spin',
                location: './spinjs',
                main: 'spin'
            },
            'dgrid',
            'put-selector',
            'xstyle',
            {
                name: 'lodash',
                location: './lodash',
                main: 'dist/lodash'
            },{
                name: 'ladda',
                location: './ladda-bootstrap',
                main: 'dist/ladda'
            },{
                name: 'layer-selector',
                location: './layer-selector'
            },{
                name: 'datepicker',
                location: './bootstrap-datepicker',
                main: 'js/bootstrap-datepicker'
            },{
                name: 'selectpicker',
                location: './bootstrap-select',
                main: 'dist/js/bootstrap-select'
            },
            'sherlock'
        ],
        map: {
            'ijit': {
                'ijit/widgets/authentication/_LoginRegisterRequestPane':
                    'app/security/_RequestPane',
                'ijit/widgets/authentication/_UserAdminUser':
                    'app/security/_UserAdminUser',
                'ijit/widgets/authentication/_UserAdminPendingUser':
                    'app/security/_UserAdminPendingUser'
            },
            'sherlock': {
                'spinjs': 'spin'
            }
        }
    };
    require(config, ['dojo/parser', 'dojo/domReady!', 'jquery'], function (parser) {
        parser.parse();
    });
}());
