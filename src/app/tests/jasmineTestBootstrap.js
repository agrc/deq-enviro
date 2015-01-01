/* global JasmineFaviconReporter, jasmineRequire*/
/*jshint unused:false*/
var dojoConfig = {
    isJasmineTestRunner: true,
    packages: [{
        name: 'matchers',
        location: 'matchers/src'
    },{
        name: 'stubmodule',
        location: 'stubmodule/src',
        main: 'stub-module'
    }],
    has: {
        'dojo-undef-api': true
    }
};

// for jasmine-favicon-reporter
jasmine.getEnv().addReporter(new JasmineFaviconReporter());
jasmine.getEnv().addReporter(new jasmineRequire.JSReporter2());
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // for sauce tests running from travis