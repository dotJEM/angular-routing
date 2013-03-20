//var testacular = require('testacular');
//var typescript = require('typescript');

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
                    declaration: false
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
                    declaration: false
                }
            },
        },
        
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            core: {
                src: [  'build/src/common.js',
                        'build/src/route.js',
                        'build/src/state.js',
                        'build/src/template.js',
                        'build/src/view.js',
                        'build/src/directives/jemView.js'],
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
        }
    });
    
    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-karma');
    
    // Default task.
    grunt.registerTask('default', ['clean', 'typescript', 'concat', 'uglify', 'karma']);
};
    //grunt.registerTask('build', 'concat min');
    //grunt.registerTask('dist', 'build jsdoc');
    //grunt.registerTask('default', 'build lint test');

    // Project configuration.
    //grunt.initConfig({
    //    builddir: 'build',
    //    pkg: '<json:package.json>',
    //    meta: {
    //        banner: '/**\n' + ' * <%= pkg.description %>\n' +
    //          ' * @version v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
    //          ' * @link <%= pkg.homepage %>\n' +
    //          ' * @license MIT License, http://www.opensource.org/licenses/MIT\n' + ' */',
    //        prefix: '(function (window, angular, undefined) {',
    //        suffix: '})(window, window.angular);'
    //    },
    //    concat: {
    //        build: {
    //            src: [
    //              '<banner:meta.banner>',
    //              '<banner:meta.prefix>',
    //              'src/common.js',
    //              'src/templateFactory.js',
    //              'src/urlMatcherFactory.js',
    //              'src/urlRouter.js',
    //              'src/state.js',
    //              'src/viewDirective.js',
    //              'src/compat.js',
    //              '<banner:meta.suffix>'
    //            ],
    //            dest: '<%= builddir %>/<%= pkg.name %>.js'
    //        }
    //    },
    //    min: {
    //        build: {
    //            src: ['<banner:meta.banner>', '<config:concat.build.dest>'],
    //            dest: '<%= builddir %>/<%= pkg.name %>.min.js'
    //        }
    //    },
    //    lint: {
    //        files: ['grunt.js', 'src/*.js', '<%= builddir %>/<%= pkg.name %>.js']
    //    },
    //    jshint: {
    //        options: {
    //            eqnull: true
    //        }
    //    },
    //    watch: {
    //        files: ['src/*.js', 'test/**/*.js'],
    //        tasks: 'build test'
    //    },
    //    typescript: {
            
    //    }
    //});

    //// Default task.
    //grunt.registerTask('build', 'concat min');
    //grunt.registerTask('dist', 'build jsdoc');
    //grunt.registerTask('default', 'build lint test');

    //grunt.registerTask('test-server', 'Start testacular server', function () {
    //    //Mark the task as async but never call done, so the server stays up
    //    var done = this.async();
    //    testacular.server.start({ configFile: 'test/test-config.js' });
    //});

    //grunt.registerTask('test', 'Run tests (make sure test-server task is run first)', function () {
    //    var done = this.async();
    //    grunt.utils.spawn({
    //        cmd: process.platform === 'win32' ? 'testacular.cmd' : 'testacular',
    //        args: process.env.TRAVIS ? ['start', 'testacular-config.js', '--single-run', '--no-auto-watch', '--reporter=dots', '--browsers=Firefox'] : ['run']
    //    }, function (error, result, code) {
    //        if (error) {
    //            grunt.warn("Make sure the testacular server is online: run `grunt test-server`.\n" +
    //              error.stdout + error.stderr);
    //            //the testacular runner somehow modifies the files if it errors(??).
    //            //this causes grunt's watch task to re-fire itself constantly,
    //            //unless we wait for a sec
    //            setTimeout(done, 1000);
    //        } else {
    //            grunt.log.write(result.stdout);
    //            done();
    //        }
    //    });
    //});

    //grunt.registerTask('jsdoc', 'Generate documentation', function () {
    //    var done = this.async();
    //    grunt.utils.spawn({
    //        cmd: 'node_modules/jsdoc/jsdoc',
    //        args: ['-c', 'jsdoc-conf.json', '-d', grunt.config('builddir') + '/doc', 'src']
    //    }, function (error, result, code) {
    //        if (error) {
    //            grunt.log.write(error.stderr + '\n');
    //            grunt.warn("jsdoc generation failed");
    //        } else {
    //            grunt.log.write(result.stderr + result.stdout);
    //        }
    //        done();
    //    });
    //});
