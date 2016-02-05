var path = require('path');
var osx = 'OS X 10.10';
var windows = 'Windows 8.1';
var browsers = [{
    browserName: 'safari',
    platform: osx
}, {
    browserName: 'firefox',
    platform: windows
}, {
    browserName: 'chrome',
    platform: windows
// waiting for: https://github.com/theintern/leadfoot/issues/67
// }, {
//     browserName: 'microsoftedge',
//     platform: 'Windows 10'
}, {
    browserName: 'internet explorer',
    platform: windows,
    version: '11'
}, {
    browserName: 'internet explorer',
    platform: 'Windows 8',
    version: '10'
}];
// ports
var seleniumPort = 4444;  // selenium server
var serverReplayPort = 9002;  // server-replay answers here (/arcgis /webdata)
var internProxyPort = 9000;  // intern proxy port (everything that goes through here gets code coverage reports)
var internTestServerPort = 9001;  // grunt-contrib-connect server for hosting intern tests
var developmentPort = 8000;


module.exports = function (grunt) {
    grunt.loadNpmTasks('intern');
    grunt.loadNpmTasks('grunt-server-replay');
    require('load-grunt-tasks')(grunt);

    var gruntFile = 'GruntFile.js';
    var jsFiles = ['src/app/**/*.js', 'tests/**/*.js', gruntFile];
    var otherFiles = [
        'src/app/**/*.html',
        'src/app/**/*.css',
        'src/index.html',
        'src/ChangeLog.html'
    ];
    var bumpFiles = [
        'package.json',
        'bower.json',
        'src/app/package.json',
        'src/app/config.js'
    ];
    var deployExcludes = [
        '!util/**',
        //'!**/*.uncompressed.js',
        '!**/*consoleStripped.js',
        '!**/*.min.*',
        '!build-report.txt'
    ];
    var deployDir = 'wwwroot/DEQEnviro';
    var secrets;
    try {
        secrets = grunt.file.readJSON('secrets.json');
    } catch (e) {
        secrets = {
            stageHost: '',
            prodHost: '',
            username: '',
            password: ''
        };
    }

    // Project configuration.
    grunt.initConfig({
        arcgis_press: {
            // not sure that this really works...
            options: {
                server: {
                    username: secrets.ags_username,
                    password: secrets.ags_password
                },
                commonServiceProperties: {
                    folder: 'DEQEnviro'
                },
                mapServerBasePath: path.join(process.cwd(), 'maps'),
                services: {
                    mapService: {
                        type: 'MapServer',
                        serviceName: 'MapService',
                        resource: 'MapService.mxd'
                    },
                    secure: {
                        type: 'MapServer',
                        serviceName: 'Secure',
                        resource: 'Secure.mxd'
                    }
                }
            },
            dev: {
                options: {
                    server: {
                        host: 'localhost'
                    },
                    commonServiceProperties: {
                        minInstancesPerNode: 0,
                        maxInstancesPerNode: 2
                    }
                }
            },
            stage: {
                options: {
                    server: {
                        host: secrets.stageHost
                    },
                    commonServiceProperties: {
                        minInstancesPerNode: 0,
                        maxInstancesPerNode: 2
                    }
                }
            },
            prod: {
                options: {
                    server: {
                        host: secrets.prodHost
                    },
                    commonServiceProperties: {
                        minInstancesPerNode: 1,
                        maxInstancesPerNode: 4
                    }
                }
            }
        },
        bump: {
            options: {
                files: bumpFiles,
                commitFiles: bumpFiles,
                push: false
            }
        },
        clean: {
            build: ['dist'],
            deploy: ['deploy']
        },
        compress: {
            options: {
                archive: 'deploy/dist.zip'
            },
            main: {
                files: [{
                    src: ['**'].concat(deployExcludes),
                    dest: './',
                    cwd: 'dist/',
                    expand: true
                }]
            }
        },
        connect: {
            unit_tests: {
                options: {
                    livereload: true,
                    port: developmentPort,
                    base: '.'
                }
            },
            dev: {
                options: {
                    livereload: true,
                    port: 8001,
                    base: 'src',
                    middleware: function (connect, options, defaultMiddleware) {
                        var proxy = require('grunt-connect-proxy/lib/utils').proxyRequest;
                        return (defaultMiddleware) ? [proxy].concat(defaultMiddleware) : [proxy];
                    }
                },
                proxies: [{
                    context: ['/arcgis', '/permissionproxy'],
                    host: 'localhost'
                }, {
                    context: '/api',
                    host: 'localhost',
                    rewrite: {
                        '/api': secrets.pathToDevApi
                    }
                }]
            },
            intern_functional: {
                options: {
                    port: internTestServerPort,
                    hostname: 'localhost',
                    middleware: function (connect, options, defaultMiddleware) {
                        var proxy = require('grunt-connect-proxy/lib/utils').proxyRequest;
                        return (defaultMiddleware) ? [proxy].concat(defaultMiddleware) : [proxy];
                    }
                },
                proxies: [{
                    // response servered from har files (see server_replay)
                    context: ['/arcgis', '/src/webdata', '/dist/webdata', '/api/search'],
                    host: 'localhost',
                    port: serverReplayPort,
                    rewrite: {
                        '/src/webdata/DEQEnviro.json': '/webdata/DEQEnviro.json',
                        '/dist/webdata/DEQEnviro.json': '/webdata/DEQEnviro.json'
                    }
                }, {
                    // response served up through intern for code coverage
                    context: '/',
                    host: 'localhost',
                    port: internProxyPort
                }]
            }
        },
        copy: {
            main: {
                files: [{expand: true, cwd: 'src/', src: ['*.html'], dest: 'dist/'}]
            }
        },
        dojo: {
            prod: {
                options: {
                    profiles: ['profiles/prod.build.profile.js', 'profiles/build.profile.js'] // Profile for build
                }
            },
            stage: {
                options: {
                    profiles: ['profiles/stage.build.profile.js', 'profiles/build.profile.js'] // Profile for build
                }
            },
            options: {
                dojo: 'src/dojo/dojo.js',
                releaseDir: '../dist',
                require: 'src/app/run.js',
                basePath: './src'
            }
        },
        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            main: {
                src: jsFiles
            }
        },
        esri_slurp: {
            options: {
                version: '3.13'
            },
            dev: {
                options: {
                    beautify: true
                },
                dest: 'src/esri'
            },
            travis: {
                options: {
                    beautify: false
                },
                dest: 'src/esri'
            }
        },
        imagemin: {
            dynamic: {
                options: {
                    optimizationLevel: 3
                },
                files: [{
                    expand: true, // Enable dynamic expansion
                    cwd: 'src/', // Src matches are relative to this path
                    src: '**/*.{png,jpg,gif}', // Actual patterns to match
                    dest: 'src/'
                }]
            }
        },
        intern: {
            options: {
                runType: 'runner',
                config: 'tests/intern',
                reporters: ['Pretty'],
                tunnelOptions: {
                    username: secrets.sauce_name,
                    accessKey: secrets.sauce_key
                },
                suites: ['tests/unit/all'],
                functionalSuites: ['tests/functional/all']
            },
            src: {
                options: {
                    leaveRemoteOpen: true,
                    tunnel: 'NullTunnel',
                    indexPrefix: 'src',
                    suites: []
                }
            },
            dist: {
                options: {
                    tunnel: 'NullTunnel',
                    indexPrefix: 'dist'
                }
            },
            travis: {
                options: {
                    environments: browsers,
                    indexPrefix: 'dist',
                    reporters: ['Runner']
                }
            },
            testServer: {
                options: {
                    tunnel: 'NullTunnel',
                    indexUrl: 'http://test.mapserv.utah.gov/deqenviro',
                    proxyPort: 9001,
                    suites: []
                }
            },
            prodServer: {
                options: {
                    tunnel: 'NullTunnel',
                    indexUrl: 'http://enviro.deq.utah.gov',
                    proxyPort: 9001,
                    suites: []
                }
            }
        },
        pkg: grunt.file.readJSON('package.json'),
        processhtml: {
            options: {},
            stage: {
                files: {
                    'dist/index.html': ['src/index.html'],
                    'dist/user_admin.html': ['src/user_admin.html']
                }
            },
            prod: {
                files: {
                    'dist/index.html': ['src/index.html'],
                    'dist/user_admin.html': ['src/user_admin.html']
                }
            }
        },
        secrets: secrets,
        selenium_start: {
            options: {
                port: seleniumPort
            }
        },
        server_replay: {
            main: {
                src: 'tests/functional/har_data/*.har',
                options: {
                    port: serverReplayPort,
                    debug: false
                }
            }
        },
        sftp: {
            stage: {
                files: {
                    './': 'deploy/dist.zip'
                },
                options: {
                    host: '<%= secrets.stageHost %>'
                }
            },
            prod: {
                files: {
                    './': 'deploy/dist.zip'
                },
                options: {
                    host: '<%= secrets.prodHost %>'
                }
            },
            options: {
                srcBasePath: 'deploy/',
                username: '<%= secrets.username %>',
                password: '<%= secrets.password %>',
                showProgress: true,
                readyTimeout: 120000
            }
        },
        sshexec: {
            options: {
                username: '<%= secrets.username %>',
                password: '<%= secrets.password %>',
                readyTimeout: 120000
            },
            stage: {
                command: ['cd ' + deployDir, 'unzip -o dist.zip', 'rm dist.zip'].join(';'),
                options: {
                    host: '<%= secrets.stageHost %>'
                }
            },
            prod: {
                command: ['cd ' + deployDir, 'unzip -o dist.zip', 'rm dist.zip'].join(';'),
                options: {
                    host: '<%= secrets.prodHost %>'
                }
            }
        },
        watch: {
            src: {
                files: jsFiles.concat(otherFiles),
                options: {
                    livereload: true
                },
                tasks: ['eslint']
            },
            intern_functional: {
                files: [jsFiles, 'tests/**/*.*'],
                tasks: ['intern:src']
            }
        }
    });

    // Default task.
    grunt.registerTask('default', [
        'if-missing:esri_slurp:dev',
        'eslint:main',
        'configureProxies:dev',
        'connect:dev',
        'connect:unit_tests',
        'watch:src'
    ]);

    // TESTING
    grunt.registerTask('travis', [
        'if-missing:esri_slurp:travis',
        'eslint',
        'server_replay',
        'build-prod',
        'configureProxies:intern_functional',
        'connect:intern_functional',
        'intern:travis'
    ]);

    // PROD
    grunt.registerTask('build-prod', [
        'newer:imagemin:dynamic',
        'clean:build',
        'dojo:prod',
        'copy',
        'processhtml:prod'
    ]);
    grunt.registerTask('deploy-prod', [
        'clean:deploy',
        'compress:main',
        'sftp:prod',
        'sshexec:prod'
    ]);

    // STAGE
    grunt.registerTask('build-stage', [
        'newer:imagemin:dynamic',
        'clean:build',
        'dojo:stage',
        'copy',
        'processhtml:stage'
    ]);
    grunt.registerTask('deploy-stage', [
        'clean:deploy',
        'compress:main',
        'sftp:stage',
        'sshexec:stage'
    ]);

    // INTERN
    grunt.registerTask('intern-functional-dev', [
        'server_replay',
        'configureProxies:intern_functional',
        'connect:intern_functional',
        'selenium_start',
        'intern:src',
        'watch:intern_functional'
    ]);
    grunt.registerTask('intern-dist', [
        'server_replay',
        'configureProxies:intern_functional',
        'connect:intern_functional',
        'selenium_start',
        'intern:dist'
    ]);
    grunt.registerTask('intern-testServer', [
        'selenium_start',
        'configureProxies:intern_functional',
        'connect:intern_functional',
        'intern:testServer'
    ]);
    grunt.registerTask('intern-prodServer', [
        'selenium_start',
        'configureProxies:intern_functional',
        'connect:intern_functional',
        'intern:prodServer'
    ]);
};
