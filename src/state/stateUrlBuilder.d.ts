/// <reference path="../refs.d.ts" />
/// <reference path="stateRules.d.ts" />
/// <reference path="stateBrowser.d.ts" />
/// <reference path="state.d.ts" />
declare class StateUrlBuilder {
    private route;
    constructor(route: dotjem.routing.IRouteService);
    public buildUrl(current: any, target: any, params?: any, base?: any): string;
}
