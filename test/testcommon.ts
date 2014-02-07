/// <reference path="../src/interfaces.d.ts" />
/// <reference path="../lib/angular/angular.d.ts" />
/// <reference path="../lib/angular/angular-mocks.d.ts" />
/// <reference path="../lib/jasmine/jasmine.d.ts" />

//TODO: Declarations below are a mess
// but if we just references the actual classes the either the TS compiler or the grunt-typescript
// task messes things up by including some files in the test output that it should not.

declare var dotjem;
declare var rootName;

declare class State {
    public children: any;
    public fullname: string;
    public name: string;
    public reloadOnOptional: boolean;
    public self: dotjem.routing.IRegisteredState;
    public parent: State;
    public route: any;
    public root: State;
    public scrollTo: any;
    public views: any;
    public resolve: any;
    constructor(_name: string, _fullname: string, _self: dotjem.routing.IState, _parent?: State);
    public add(child: State): State;
    public resolveRoute(): string;
    public is(state: string): boolean;
    public isActive(state: string): any;
}

declare class StateComparer {
    public buildStateArray(state: any, params: any): any[];
    public compare(from: any, to: any, fromParams: any, toParams: any, forceReload: any): {
        array: any[];
        stateChanges: boolean;
        paramChanges: boolean;
    };
}

declare class StateBrowser {
    constructor(root: State);
    public lookup(path: string, stop?: number): State;
    public resolve(origin: any, path: any, wrap?: any): State;
}

declare class StateFactory {
    constructor(routes: dotjem.routing.IRouteProvider, transitions: dotjem.routing.ITransitionProvider);
    public createRoute(stateRoute: string, parentRoute: any, stateName: string, reloadOnSearch: boolean): dotjem.routing.IWhenRouteProvider;
    public createState(fullname: string, state: dotjem.routing.IState, parent?: State): State;
}

declare class StateRules {
    static validateName(name: string): void;
    static validateTarget(target: string): boolean;
}

declare class StateUrlBuilder {
    constructor(route: dotjem.routing.IRouteService);
    public buildUrl(current: any, target: any, params?: any, base?: any): string;
}

interface IState {}

interface TestAccessor {
    State;
    StateBrowser;
    StateComparer;
    StateFactory;
    StateRules;
    StateUrlBuilder;
    RootName;

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

    dotjem.nameWithRoot = function(name: string) {
        if (name.indexOf('root') === 0)
            return dotjem.RootName + name.substring(4);

        return name.charAt(0) === '.' ? dotjem.RootName + name : dotjem.RootName + '.' + name;
    };

    dotjem.replaceWithRoot = function(name: string, sub?: string) {
        return name.replace(new RegExp(sub || 'root', 'g'), dotjem.RootName);
    };

    return dotjem;
} (typeof dotjem != 'undefined' ? dotjem : {});

