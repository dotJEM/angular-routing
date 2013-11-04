var test = (function (dotjem) {
    if(angular.isUndefined(dotjem.State)) {
        dotjem.State = State;
    }
    if(angular.isUndefined(dotjem.StateBrowser)) {
        dotjem.StateBrowser = StateBrowser;
    }
    if(angular.isUndefined(dotjem.StateComparer)) {
        dotjem.StateComparer = StateComparer;
    }
    if(angular.isUndefined(dotjem.StateFactory)) {
        dotjem.StateFactory = StateFactory;
    }
    if(angular.isUndefined(dotjem.StateRules)) {
        dotjem.StateRules = StateRules;
    }
    if(angular.isUndefined(dotjem.StateUrlBuilder)) {
        dotjem.StateUrlBuilder = StateUrlBuilder;
    }
    if(angular.isUndefined(dotjem.RootName)) {
        dotjem.RootName = rootName;
    }
    dotjem.nameWithRoot = function (name) {
        if(name.indexOf('root') === 0) {
            return dotjem.RootName + name.substring(4);
        }
        return name.charAt(0) === '.' ? dotjem.RootName + name : dotjem.RootName + '.' + name;
    };
    dotjem.replaceWithRoot = function (name, sub) {
        return name.replace(new RegExp(sub || 'root', 'g'), dotjem.RootName);
    };
    return dotjem;
})(typeof dotjem != 'undefined' ? dotjem : {
});
