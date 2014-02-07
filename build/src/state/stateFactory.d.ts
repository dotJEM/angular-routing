/// <reference path="../refs.d.ts" />
/// <reference path="stateRules.d.ts" />
/// <reference path="state.d.ts" />
declare class StateFactory {
    private routes;
    private transitions;
    constructor(routes: dotjem.routing.IRouteProvider, transitions: dotjem.routing.ITransitionProvider);
    public createRoute(stateRoute: string, parentRoute: any, stateName: string, reloadOnSearch: boolean): dotjem.routing.IWhenRouteProvider;
    public createState(fullname: string, state: dotjem.routing.IState, parent?: State): State;
}
