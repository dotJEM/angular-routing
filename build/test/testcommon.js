/// <reference path="../src/interfaces.d.ts" />
/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="../lib/angular/angular-mocks-1.0.d.ts" />
/// <reference path="../lib/jasmine/jasmine.d.ts" />
/// <reference path="../src/state/state.ts" />
/// <reference path="../src/state/stateBrowser.ts" />
/// <reference path="../src/state/stateComparer.ts" />
/// <reference path="../src/state/stateFactory.ts" />
/// <reference path="../src/state/stateRules.ts" />
/// <reference path="../src/state/stateUrlBuilder.ts" />
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
    return dotjem;
})(typeof dotjem != 'undefined' ? dotjem : {
});
