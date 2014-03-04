/*global module:false*/
module.exports = function (grunt) {
    "use strict";

    var files = require("./dev/files").files;

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: grunt.file.read('banner'),
        clean: {
            build: {
                src: ['build']
            },
            temp: {
                src: ['temp']
            }

        },

        typescript: {
            core: {
                src: ['src/**/*.ts'],
                dest: 'build',
                options: {
                    module: 'commonjs',
                    target: 'es5',
                    sourcemap: false,
                    declaration: true,
                    comments: true
                }
            },
            test: {
                src: ['test/**/*.ts'],
                dest: 'build',
                options: {
                    module: 'commonjs',
                    target: 'es5',
                    sourcemap: false,
                    declaration: false,
                    comments: true
                }
            },
            docs: {
                src: ['gh-pages/**/*.ts'],
                dest: 'build',
                options: {
                    module: 'commonjs',
                    target: 'es5',
                    sourcemap: false,
                    declaration: false,
                    comments: true
                }
            }
        },

        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            core: {
                src: files.src,
                dest: 'build/<%= pkg.name %>.js'
            },
            legacy: {
                src: files.legacy,
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
            }
        },

        karma: {
            jquery: {
                configFile: 'test-grunt-jquery-config.js',
                port: 4000,
                runnerPort: 4010,
                singleRun: true,
                browsers: ['PhantomJS']
            },
            jqlite: {
                configFile: 'test-grunt-jqlite-config.js',
                port: 5000,
                runnerPort: 5010,
                singleRun: true,
                browsers: ['PhantomJS']
            }
        },

        connect: {
            docs: {
                options: {
                    port: 8080,
                    base: 'build/gh-pages/'
                }
            },

            devdocs: {
                options: {
                    port: 8090,
                    base: 'gh-pages/'
                }
            }
        },

        watch: {
            dev: {
                files: [
                    'src/**/*.ts',
                    'gh-pages/**/*.ts',
                    'gh-pages/templates/**/*.*',
                    'gh-pages/styles/**/*.*',
                    'gh-pages/samples/**/*.*',
                    'test/**/*.ts' ],
                tasks: ['build']
            }
        },

        copy: {
            release: {
                files: [
                    {
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
                    }
                ]
            },

            ngdocs: {
                files: [
                    {
                        expand: true,
                        cwd: 'temp/partials/api/',
                        src: '*.html',
                        dest: 'gh-pages/docs/partials/'
                    },
                    {
                        src: 'temp/js/docs-setup.js',
                        dest: 'gh-pages/docs/docs-setup.js'
                    },
                    {
                        expand: true,
                        cwd: 'build',
                        src: ['angular-routing.js', 'angular-routing.min.js'],
                        dest: 'gh-pages/assets/scripts/angular-routing/impl/'
                    }
                ]
            }
        },

        //https://npmjs.org/package/grunt-ngdocs
        ngdocs: {
            options: {
                dest: 'temp',
                title: "dotJEM Angular Routing",
                html5Mode: false
            },
            all: ['build/src/**/*.js']
        },

        tslint: {
            options: {
                configuration: grunt.file.readJSON("tslint.json")
            },
            files: {
                src: ['src/**/*.ts']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-ngdocs');
    grunt.loadNpmTasks('grunt-tslint');

    // Default task.
    grunt.registerTask('default', ['clean', 'build', 'karma']);
    grunt.registerTask('develop', ['clean', 'build', 'connect', 'watch']);

    grunt.registerTask('build', ['tslint', 'typescript', 'concat', 'uglify', 'ngdocs', 'copy:ngdocs', 'clean:temp']);
};