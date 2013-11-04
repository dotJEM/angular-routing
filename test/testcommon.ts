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

interface TestAccessor {
    State; StateBrowser; StateComparer; StateFactory; StateRules; StateUrlBuilder; RootName;

    nameWithRoot(name: string): string;
    replaceWithRoot(name: string, sub?: string): string;
}

var test: TestAccessor = function(dotjem): any {

    if (angular.isUndefined(dotjem.State)) dotjem.State = State;
    if (angular.isUndefined(dotjem.StateBrowser)) dotjem.StateBrowser = StateBrowser;
    if (angular.isUndefined(dotjem.StateComparer)) dotjem.StateComparer = StateComparer;
    if (angular.isUndefined(dotjem.StateFactory)) dotjem.StateFactory = StateFactory;
    if (angular.isUndefined(dotjem.StateRules)) dotjem.StateRules = StateRules;
    if (angular.isUndefined(dotjem.StateUrlBuilder)) dotjem.StateUrlBuilder = StateUrlBuilder;
    if (angular.isUndefined(dotjem.RootName)) dotjem.RootName = rootName;



    dotjem.nameWithRoot = function (name: string) {
        if (name.indexOf('root') === 0)
            return dotjem.RootName + name.substring(4);

        return name.charAt(0) === '.' ? dotjem.RootName + name : dotjem.RootName + '.' + name;
    }

    dotjem.replaceWithRoot = function (name: string, sub?: string) {
        return name.replace(new RegExp(sub || 'root', 'g'), dotjem.RootName);
    }

    return dotjem;
} (typeof dotjem != 'undefined' ? dotjem : {});

