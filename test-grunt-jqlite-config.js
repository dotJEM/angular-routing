module.exports = function (config) {
    config.set({
        //browsers: ['PhantomJS'],
        frameworks: ['jasmine'],
        logLevel: config.LOG_INFO,
        loggers: [{ type: 'console' }],
        reporters: ['dots'],
        autoWatch: false,
        files: [
          'lib/angular/impl/angular.js',
          'lib/angular/impl/angular-mocks.js',
            
          'build/angular-routing.js',
          'build/angular-routing.legacy.js',

          'build/test/testcommon.js',

          'build/test/**/*Spec.js'
        ],
    });
};
