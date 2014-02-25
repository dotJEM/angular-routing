/*global module:false*/
module.exports = function (grunt) {
    "use strict";

    var files = require("./dev/files").files;

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: grunt.file.read('banner'),
        clean: {
            src: ['build']
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
            },
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
            },
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
            }
        },

        watch: {
            files: ['src/**/*.ts'],
            tasks: ['build']
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
            },
            docs: {
                
            }
        },
        
        //https://npmjs.org/package/grunt-ngdocs
        ngdocs: {
            options: {
                dest: 'temp',
                title: "dotJEM Angular Routing",
                html5Mode: false,
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
    grunt.registerTask('build', ['typescript', 'concat', 'uglify']);
    grunt.registerTask('default', ['clean', 'tslint', 'build', 'karma', 'ngdocs']);
    grunt.registerTask('release', ['default', 'copy:release']);
    grunt.registerTask('server', ['clean', 'build', 'connect', 'watch']);
    grunt.registerTask('docs', ['clean', 'build', 'ngdocs']);
};