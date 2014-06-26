/// <reference path="refs.d.ts" />
declare var isDefined: (value: any) => boolean, isUndefined: (value: any) => boolean, isFunction: (value: any) => boolean, isString: (value: any) => boolean, isObject: (value: any) => boolean, isArray: (value: any) => boolean, isBool: (arg: any) => boolean, forEach: (obj: any, iterator: (value: any, key: any) => any, context?: any) => any, extend: (destination: any, ...sources: any[]) => any, copy: (source: any, destination?: any) => any, equals: (value1: any, value2: any) => boolean, element: ng.IAugmentedJQueryStatic, noop: (...args: any[]) => void, rootName: string;
declare function inherit(parent: any, extra?: any): any;
declare function toName(named: any): string;
declare function isArrayAnnotatedFunction(array: any[]): boolean;
declare function isInjectable(fn: any): boolean;
interface IParam {
    name: string;
    converter: string;
    args: string;
    index: number;
    lastIndex: number;
    catchAll: boolean;
}
declare function buildParams(all?: any, path?: any, search?: any): any;
declare function buildParamsFromObject(params?: any): any;
declare function toKeyValue(obj: any, prepend?: any): string;
declare function encodeUriSegment(val: any): string;
declare function encodeUriQuery(val: any, pctEncodeSpaces: any): string;
declare var esc: RegExp;
declare function escapeRegex(exp: string): string;
declare var errors: {
    routeCannotBeUndefined: string;
    valueCouldNotBeMatchedByRegex: string;
    regexConverterNotValid: string;
    invalidNumericValue: string;
    invalidBrowserPathExpression: string;
    expressionOutOfBounds: string;
    couldNotFindStateForPath: string;
};
declare var EVENTS: {
    LOCATION_CHANGE: string;
    ROUTE_UPDATE: string;
    ROUTE_CHANGE_START: string;
    ROUTE_CHANGE_SUCCESS: string;
    ROUTE_CHANGE_ERROR: string;
    STATE_UPDATE: string;
    STATE_CHANGE_START: string;
    STATE_CHANGE_SUCCESS: string;
    STATE_CHANGE_ERROR: string;
    VIEW_UPDATE: string;
    VIEW_REFRESH: string;
    VIEW_PREP: string;
};
