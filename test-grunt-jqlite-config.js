files = [
  JASMINE,
  JASMINE_ADAPTER,
  'lib/angular/impl/angular.js',
  'lib/angular/impl/angular-mocks.js',
  'build/angular-routing.js',
  'build/angular-routing.legacy.js',

  'build/test/testcommon.js',

  'build/test/**/*Spec.js'
];

exclude = ['**/*jasmine*/**', '**/*jstd*/**'];
reporter = 'dots';
colors = true;
logLevel = LOG_INFO;
logColors = true;
autoWatch = false;
reporters = ['dots'];

//junitReporter = {
//    outputFile: 'ts-test-out.xml'
//};