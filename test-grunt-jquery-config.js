module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        logLevel: config.LOG_INFO,
        loggers: [{ type: 'console' }],
        reporters: ['dots'],
        browsers: ['PhantomJS'],
        autoWatch: false,
        singleRun: true,
        files: [
          'lib/jquery/impl/jquery-1.9.1.js',
          'lib/angular/impl/angular.js',
          'lib/angular/impl/angular-mocks.js',

          'build/angular-routing.js',
          'build/angular-routing.legacy.js',

          'build/test/**/*.js'
        ],
    });
};