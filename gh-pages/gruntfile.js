/**
 * Created by jmd on 05-02-14.
 */
/*global module:false*/
module.exports = function (grunt) {
    "use strict";
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: "", //grunt.file.read('../banner'),
        clean: {
            src: ['build']
        },

        typescript: {
            dev: {
                src: ['scripts/**/*.ts'],
                options: {
                    module: 'commonjs',
                    target: 'es5',
                    sourcemap: true,
                    declaration: false,
                    comments: true
                }
            },
            build: {
                src: ['src/client/**/*.ts'],
                dest: 'build',
                options: {
                    module: 'commonjs',
                    target: 'es5',
                    sourcemap: false,
                    declaration: false,
                    comments: false
                }
            }
        },

        connect: {
            watch: {
                options: {
                    port: 9500,
                    base: '',
                    keepalive: false
                }
            },
            keepalive: {
                options: {
                    port: 9500,
                    base: '',
                    keepalive: true
                }
            }
        },

        watch: {
            files: ['scripts/**/*.ts'],
            tasks: ['build']
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-ngdocs');
    grunt.loadNpmTasks('grunt-tslint');

    // Default task.
    grunt.registerTask('build', ['typescript']);
    grunt.registerTask('default', ['server']);
    grunt.registerTask('watch', ['connect', 'watch']);
    grunt.registerTask('server', ['connect:keepalive']);
};