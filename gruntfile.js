/*global module:false*/
module.exports = function (grunt) {
    "use strict";
    
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/* THIS IS A BANNER */ \r\n',

        clean: {
            src: ['build']
        },
        
        typescript: {
            src: {
                src: ['src/**/*.ts'],
                dest: 'build/src',
                options: {
                    module: 'commonjs', //or commonjs
                    target: 'es5', //or es3
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
                    module: 'commonjs', //or commonjs
                    target: 'es5', //or es3
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
                src: [  'src/prefix',
                        'build/src/common.js',
                        'build/src/route.js',
                        'build/src/transition.js',
                        'build/src/state.js',
                        'build/src/template.js',
                        'build/src/view.js',
                        'build/src/directives/uiView.js',
                        'src/suffix'],
                dest: 'build/<%= pkg.name %>.js'
            },
            legacy: {
                src: [ 'build/src/legacy/templateDecorator.js' ],
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
            unit: {
                configFile: 'test-grunt-config.js',
                runnerPort: 9999,
                singleRun: true,
                browsers: ['PhantomJS']
            }
        },
        
        yuidoc: {
            src: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: './build/src',//'./build/<%= pkg.name %>.js', //.
                    outdir: './doc/yuidoc/'
                }
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
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-karma');
    
    // Default task.
    grunt.registerTask('default', ['clean', 'typescript', 'concat', 'uglify', 'karma','yuidoc']);
};