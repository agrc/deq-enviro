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
            ) ? '/src': './',
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
                location: 'jquery/dist',
                main: 'jquery'
            },{
                name: 'bootstrap',
                location: 'bootstrap',
                main: 'dist/js/bootstrap'
            },{
                name: 'spin',
                location: 'spinjs',
                main: 'spin'
            },
            'dgrid',
            'put-selector',
            'xstyle',
            {
                name: 'underscore.string',
                location: 'underscore-string',
                main: 'lib/underscore.string'
            }
        ]
    };
    require(config, [
        'jquery',
        'app/App',

        'dojo/dom',

        'esri/config',


        'dojo/domReady!'
    ],

    function (
        $,
        App,

        dom,

        esriConfig
        ) {
        // force api to use CORS on mapserv thus removing the test request on app load
        // e.g. http://mapserv.utah.gov/ArcGIS/rest/info?f=json
        esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');

        // don't initialize if this is the jasmine test runner
        if (!window.dojoConfig || !window.dojoConfig.isJasmineTestRunner) {
            var app = new App({}, dom.byId('appDiv'));
            app.startup();
        }
    });
})();