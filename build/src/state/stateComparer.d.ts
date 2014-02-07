/// <reference path="../refs.d.ts" />
/// <reference path="state.d.ts" />
declare class StateComparer {
    public buildStateArray(state: any, params: any): any[];
    public compare(from: any, to: any, fromParams: any, toParams: any, forceReload: any): {
        array: any[];
        stateChanges: boolean;
        paramChanges: boolean;
    };
}
