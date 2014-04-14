/* global JasmineFaviconReporter */
/*jshint unused:false*/
var dojoConfig = {
    // isDebug: false,
    isJasmineTestRunner: true,
    packages: [{
        name: 'matchers',
        location: 'matchers/src'
    }]
};

// for jasmine-favicon-reporter
jasmine.getEnv().addReporter(new JasmineFaviconReporter());

// // override alert to console
// window.alert = function(msg) {
//     console.error('ALERT OVERRIDDEN TO LOG: ' + msg);
// };