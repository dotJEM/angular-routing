module.exports = function (config) {
    config.set({
        //browsers: ['PhantomJS'],
        browsers: ['Chrome'],
        frameworks: ['jasmine'],
        logLevel: config.LOG_INFO,
        loggers: [{ type: 'console' }],
        reporters: ['progress'],
        autoWatch: true,
        port: 9100,
        files: [
            'lib/angular/impl/angular.js',
            'lib/angular/impl/angular-mocks.js',

            'src/common.js',
            'src/route.js',
            'src/stateTransition.js',
            'src/state.js',
            'src/pipeline.js',
            'src/resolve.js',
            'src/template.js',
            'src/view.js',
            'src/scroll.js',
            'src/inject.js',
            
            'src/state/state.js',
            'src/state/stateBrowser.js',
            'src/state/stateComparer.js',
            'src/state/stateFactory.js',
            'src/state/stateRules.js',
            'src/state/stateUrlBuilder.js',
            
            'src/directives/jemView.js',
            'src/directives/jemAnchor.js',
            'src/directives/jemLink.js',

            'src/legacy/templateDecorator.js',

            'test/**/*.js'
        ],
    });
};
