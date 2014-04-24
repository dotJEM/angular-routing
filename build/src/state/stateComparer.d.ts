/// <reference path="../refs.d.ts" />
/// <reference path="state.d.ts" />
declare class StateComparer {
    public isSameState(from: any, to: any): boolean;
    public isEquals(from: any, to: any): boolean;
    public path(from: any, to: any, fromParams: any, toParams: any, options?: any): any;
    public toArray(state: any, params: any, activate: any): any[];
    public extractParams(params: any, current: any): {};
}
