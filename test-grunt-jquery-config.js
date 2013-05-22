// Testacular configuration file

// list of files / patterns to load in the browser
//var routerFiles = require(__dirname + '/ui-router-files.js');
//files = angularFiles.mergeFiles(JASMINE, JASMINE_ADAPTER, 'jstdJquery');


files = [
  JASMINE,
  JASMINE_ADAPTER,
  'lib/jquery/impl/jquery-1.9.1.js',
  'lib/angular/impl/angular.js',
  'lib/angular/impl/angular-mocks.js',

  'build/angular-routing.js',
  'build/angular-routing.legacy.js',

  'build/test/**/*Spec.js'
];

// list of files to exclude
exclude = ['**/*jasmine*/**', '**/*jstd*/**'];//.concat(angularFiles.files.jstdJqueryExclude);

// use dots reporter, as travis terminal does not support escaping sequences
// possible values: 'dots' || 'progress'
reporter = 'dots';

// these are default values, just to show available options

// web server port
port = 8080;

// cli runner port
runnerPort = 9100;

// enable / disable colors in the output (reporters and logs)
colors = true;

// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;
logColors = true;

// enable / disable watching file and executing tests whenever any file changes
autoWatch = false;

// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari
// - PhantomJS
browsers = ['PhantomJS'];
reporters = ['dots' /*'dots' /*, 'junit'*/];

//junitReporter = {
//    outputFile: 'ts-test-out.xml'
//};