/* eslint no-unused-vars: 0 */
var profile = {
    basePath: '../src',
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: 'uglify',
    layerOptimize: 'uglify',
    stripConsole: 'all',
    selectorEngine: 'acme',
    layers: {
        'dojo/dojo': {
            include: [
                'dojo/i18n',
                'dojo/domReady',
                'app/run',
                'app/App',
                'esri/dijit/Attribution',
                'dojox/gfx/path',
                'dojox/gfx/svg',
                'dojox/gfx/shape',
                'app/security/_RequestPane',
                'ladda/dist/spin'
            ],
            includeLocales: ['en-us'],
            customBase: true,
            boot: true
        },
        'ijit/widgets/authentication/UserAdmin': {
            include: [
                'app/security/_UserAdminUser'
            ],
            exclude: ['dojo/dojo']
        }
    },
    packages: ['dgrid1', 'dstore', {
        name: 'matchers',
        location: 'matchers/src'
    },{
        name: 'stubmodule',
        location: 'stubmodule/src',
        main: 'stub-module'
    },{
        name: 'moment',
        location: 'moment',
        main: 'moment',
        trees: [
          // don't bother with .hidden, tests, min, src, and templates
          ['.', '.', /(\/\.)|(~$)|(test|txt|src|min|templates)/]
        ],
        resourceTags: {
            amd: function amd(filename, mid) {
                return /\.js$/.test(filename);
            }
        }
    },{
        name: 'mustache',
        location: 'mustache',
        main: 'mustache'
    }],
    map: {
        'ladda': {
            'spin': 'ladda/dist/spin'
        },
        'sherlock': {
            'spinjs': 'spin'
        }
    },
    userConfig: {
        packages: ['app', 'dijit', 'dojox', 'agrc', 'ijit', 'esri', 'layer-selector']
    },
    staticHasFeatures: {
        'dojo-trace-api': 0,
        'dojo-log-api': 0,
        'dojo-publish-privates': 0,
        'dojo-sync-loader': 0,
        'dojo-xhr-factory': 0,
        'dojo-test-sniff': 0
    }
};
