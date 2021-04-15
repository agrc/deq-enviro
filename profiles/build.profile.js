/* eslint no-unused-vars: 0 */
var profile = {
    basePath: '../src',
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: false,
    layerOptimize: false,
    stripConsole: 'all',
    selectorEngine: 'acme',
    layers: {
        'dojo/dojo': {
            include: [
                'app/App',
                'app/run',
                'app/security/_LayersMixin',
                'app/security/_RequestPane',
                'app/security/_UserAdminUser',
                'app/security/_UserAdminPendingUser',
                'dojox/gfx/filters',
                'dojox/gfx/svg',
                'dojox/gfx/svgext',
                'esri/layers/LabelLayer',
                'esri/layers/VectorTileLayerImpl',
                'esri/PopupInfo',
                'esri/tasks/RelationshipQuery',
                'xstyle/core/load-css'
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
    }, {
        name: 'stubmodule',
        location: 'stubmodule/src',
        main: 'stub-module'
    }, {
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
    }, {
        name: 'mustache',
        location: 'mustache',
        main: 'mustache'
    }],
    map: {
        ladda: {
            spin: 'ladda/dist/spin'
        },
        sherlock: {
            spinjs: 'spin'
        }
    },
    userConfig: {
        packages: ['app', 'dijit', 'dojox', 'agrc', 'ijit', 'esri', 'layer-selector', 'sherlock']
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
