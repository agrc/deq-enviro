module.exports = function (grunt) {
    grunt.loadNpmTasks('intern');
    require('load-grunt-tasks')(grunt);

    var gruntFile = 'GruntFile.js';
    var jsFiles = ['_src/app/**/*.js', 'tests/**/*.js', gruntFile];
    var otherFiles = [
        '_src/app/**/*.html',
        '_src/app/**/*.css',
        '_src/index.html',
        '_src/ChangeLog.html',
        '_src/webdata/DEQEnviro.json'
    ];
    var bumpFiles = [
        'package.json',
        'bower.json',
        '_src/app/package.json',
        '_src/app/config.js'
    ];
    var deployExcludes = [
        '!util/**',
        '!**/*consoleStripped.js',
        '!build-report.txt'
    ];
    var deployDir = 'wwwroot/deqenviro';
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
        babel: {
            options: {
                sourceMap: true,
                presets: ['latest'],
                plugins: ['transform-remove-strict-mode']
            },
            src: {
                files: [{
                    expand: true,
                    cwd: '_src/app/',
                    src: ['**/*.js'],
                    dest: 'src/app/'
                }]
            }
        },
        bump: {
            options: {
                files: bumpFiles,
                commitFiles: bumpFiles.concat(['_src/ChangeLog.html']),
                push: false
            }
        },
        cachebreaker: {
            main: {
                options: {
                    match: [
                        'dojo/dojo.js',
                        'app/resources/App.css',
                        'app/run.js',
                        'app/resources/UserAdmin.css'
                    ]
                },
                files: {
                    src: ['dist/*.html']
                }
            }
        },
        clean: {
            build: ['dist'],
            deploy: ['deploy'],
            src: ['src/app']
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
            unitTests: {
                options: {
                    livereload: true,
                    port: 8000,
                    base: '.'
                }
            }
        },
        copy: {
            dist: {
                files: [{ expand: true,
                    cwd: 'src/',
                    src: ['*.html', 'web.config'],
                    dest: 'dist/' }]
            },
            src: {
                expand: true,
                cwd: '_src',
                src: ['**/*.html', '**/*.css', '**/*.png', '**/*.jpg', '**/*.json', 'app/package.json', 'web.config'],
                dest: 'src'
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
            main: {
                options: {
                    runType: 'runner',
                    config: 'tests/intern',
                    reporters: ['Runner'],
                    tunnel: 'SauceLabsTunnel'
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
                path: './' + deployDir + '/',
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
            main: {
                files: jsFiles.concat(otherFiles),
                options: {
                    livereload: true
                },
                tasks: ['eslint', 'newer:babel', 'newer:copy:src']
            }
        }
    });

    // Default task.
    grunt.registerTask('default', [
        'eslint',
        'clean:src',
        'babel',
        'copy:src',
        'connect',
        'watch'
    ]);

    // TESTING
    grunt.registerTask('test', [
        'eslint',
        'babel',
        'copy:src',
        'intern'
    ]);

    // PROD
    grunt.registerTask('build-prod', [
        'clean:src',
        'babel',
        'copy:src',
        'newer:imagemin:dynamic',
        'clean:build',
        'dojo:prod',
        'copy:dist',
        'processhtml:prod',
        'cachebreaker'
    ]);
    grunt.registerTask('deploy-prod', [
        'clean:deploy',
        'compress:main',
        'sftp:prod',
        'sshexec:prod'
    ]);

    // STAGE
    grunt.registerTask('build-stage', [
        'clean:src',
        'babel',
        'copy:src',
        'newer:imagemin:dynamic',
        'clean:build',
        'dojo:stage',
        'copy:dist',
        'processhtml:stage',
        'cachebreaker'
    ]);
    grunt.registerTask('deploy-stage', [
        'clean:deploy',
        'compress:main',
        'sftp:stage',
        'sshexec:stage'
    ]);
};
