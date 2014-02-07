module.exports = function (config) {
    config.set({
        frameworks: ['jasmine'],
        logLevel: config.LOG_INFO,
        loggers: [{ type: 'console' }],
        reporters: ['dots'],
        //browsers: ['PhantomJS'],
        browsers: ['Chrome'],
        autoWatch: false,
        //singleRun: true,
        files: [
          'lib/angular/impl/angular.js',
          'lib/angular/impl/angular-mocks.js',
            
          'build/angular-routing.js',
          'build/angular-routing.legacy.js',

          'build/test/**/*.js'
        ],
    });
};
