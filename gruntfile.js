/*global module:false*/
module.exports = function (grunt) {
    "use strict";

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: grunt.file.read('banner'),
        clean: {
            src: ['build']
        },

        typescript: {
            src: {
                src: ['src/**/*.ts'],
                dest: 'build/src',
                options: {
                    module: 'commonjs',
                    target: 'es5',
                    base_path: 'src',
                    sourcemap: false,
                    declaration: false,
                    comments: true
                }
            },
            test: {
                src: ['test/**/*.ts'],
                dest: 'build/test',
                options: {
                    module: 'commonjs',
                    target: 'es5',
                    base_path: 'test',
                    sourcemap: false,
                    declaration: false,
                    comments: true
                }
            },
        },

        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            core: {
                src: ['src/prefix',
                        'build/src/common.js',
                        'build/src/route.js',
                        'build/src/stateTransition.js',
                        'build/src/state.js',
                        'build/src/template.js',
                        'build/src/view.js',
                        'build/src/scroll.js',
                        'build/src/directives/uiView.js',
                        'src/suffix'],
                dest: 'build/<%= pkg.name %>.js'
            },
            legacy: {
                src: ['build/src/legacy/prefix',
                        'build/src/legacy/templateDecorator.js',
                        'build/src/legacy/suffix'
                ],
                dest: 'build/<%= pkg.name %>.legacy.js'
            }
        },

        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            core: {
                src: '<%= concat.core.dest %>',
                dest: 'build/<%= pkg.name %>.min.js'
            },
            legacy: {
                src: '<%= concat.legacy.dest %>',
                dest: 'build/<%= pkg.name %>.legacy.min.js'
            },
        },

        karma: {
            jquery: {
                configFile: 'test-grunt-jquery-config.js',
                runnerPort: 5000,
                singleRun: true,
                browsers: ['PhantomJS']
            },
            jqlite: {
                configFile: 'test-grunt-jqlite-config.js',
                runnerPort: 5010,
                singleRun: true,
                browsers: ['PhantomJS']
            }
        },

        connect: {
            substates: {
                options: {
                    port: 8080,
                    base: 'samples/substates'
                }
            }
        },

        watch: {
            files: ['src/**/*.ts'],
            tasks: ['build']
        },

        yuidoc: {
            src: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: './build/src',
                    outdir: './doc/yuidoc/'
                }
            }
        },

        copy: {
            release: {
                files: [{
                    expand: true,
                    src: ['build/*.js'],
                    dest: 'release/',
                    rename: function (dest, src) {
                        if (src.indexOf('.min') !== -1) {
                            return src
                                .replace('.min.js', '-<%= pkg.version %>.min.js')
                                .replace('build', 'release/v<%= pkg.version %>');
                        } else {
                            return src
                                .replace('.js', '-<%= pkg.version %>.js')
                                .replace('build', 'release/v<%= pkg.version %>');
                        }
                    }
                }]
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-karma');

    // Default task.
    grunt.registerTask('build', ['typescript', 'concat', 'uglify']);
    grunt.registerTask('default', ['clean', 'build', 'karma:jquery', 'yuidoc']);
    grunt.registerTask('release', ['default', 'copy:release']);
    grunt.registerTask('server', ['clean', 'build', 'connect', 'watch']);
};