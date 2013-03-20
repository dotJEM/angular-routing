routerFiles = {
    'router': [
      //'tssrc/routeProvider.js',
      //'tssrc/stateProvider.js',
      //'tssrc/templateProvider.js',
      //'tssrc/viewDirective.js',
      'tssrc/viewService.js'
    ]
};

if (exports) {
    exports.files = routerFiles;
    exports.mergeFiles = function mergeFiles() {
        var files = [];

        [].splice.call(arguments, 0).forEach(function (file) {
            if (file.match(/testacular/)) {
                files.push(file);
            } else {
                angularFiles[file].forEach(function (f) {
                    // replace @ref
                    var match = f.match(/^\@(.*)/);
                    if (match) {
                        var deps = routerFiles[match[1]];
                        files = files.concat(deps);
                    } else {
                        if (!/jstd|jasmine/.test(f)) { //TODO(i): remove once we don't have jstd/jasmine in repo
                            files.push(f);
                        }
                    }
                });
            }
        });

        return files;
    }
}
