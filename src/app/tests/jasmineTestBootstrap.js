/*jshint unused:false*/
var dojoConfig = {
    // isDebug: false,
    isJasmineTestRunner: true,
    packages: ['matchers', {
        name: 'stubmodule',
        location: 'stubmodule/src',
        main: 'StubModule'
    }]
};

// // override alert to console
// window.alert = function(msg) {
//     console.error('ALERT OVERRIDDEN TO LOG: ' + msg);
// };