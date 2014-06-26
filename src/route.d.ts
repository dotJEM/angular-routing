/// <reference path="refs.d.ts" />
interface ISegment {
    name: string;
    converter: () => (arg: any) => any;
}
interface IExpression {
    exp?: RegExp;
    segments?: ISegment[];
    params?: any;
    name?: string;
}
interface IRoute {
    self: dotjem.routing.IRoute;
    redirect: ($location: any, params: any) => any;
    match: (path: string) => any;
}
declare module ng {
    interface IBrowserService {
        baseHref(): string;
    }
}
/**
* @ngdoc object
* @name dotjem.routing.$routeProvider
*
* @description
* Used for configuring routes. See {@link dotjem.routing.$route $route} for an example.
*/
declare var $RouteProvider: any[];
