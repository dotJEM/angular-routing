module.exports = function (config) {
    config.set({
        browsers: ['Chrome'],
        frameworks: ['jasmine'],
        logLevel: config.LOG_INFO,
        loggers: [{ type: 'console' }],
        reporters: ['dots'],
        autoWatch: true,
        port: 9100,
        files: [
          'lib/jquery/impl/jquery-1.9.1.js',
          'lib/angular/impl/angular.js',
          'lib/angular/impl/angular-mocks.js',

          'build/angular-routing.js',
          'build/angular-routing.legacy.js',

          //'build/test/util/**/*.js',
          //'build/test/testcommon.js',
          'build/test/**/*.js'
        ],
    });
};
