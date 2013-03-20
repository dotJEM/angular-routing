/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />

'use strict';

interface ISegment {
    name: string;
    converter: (arg: any) => any;
}

interface IExpression {
    //partial: RegExp;
    complete: RegExp;
    segments: ISegment[];
}

interface IRoute {
    self: ui.routing.IRoute;
    redirect: ($location, params) => any;
    match: (path: string) => any;
}

function $RouteProvider() {
    var routes = {},
        converters = {},
        decorators = {},
        caseSensitive = true;

    //Public Methods

    this.convert = (name: string, converter) => {
        //Note: We wan't to allow overwrite
        converters[name] = converter;
        return this;
    };

    this.when = (path: string, route: ui.routing.IRoute) => {
        var normalized = normalizePath(path);
        routes[normalized.name] = {
            self: angular.extend({ reloadOnSearch: true }, route),
            redirect: createRedirector(route.redirectTo),
            match: createMatcher(path),
            path: path,
            params: normalized.params
        };

        return this;
    };

    this.otherwise = (route: ui.routing.IRoute) => {
        this.when(null, route);
        return this;
    };

    this.decorate = (name: string, decorator: (route) => any) => {
        //Note: We wan't to allow overwrite
        decorators[name] = decorator;
        return this;
    };

    this.ignoreCase = () => {
        caseSensitive = false;
        return this;
    };

    this.matchCase = () => {
        caseSensitive = true;
        return this;
    };

    //Scoped Methods

    function interpolate(url, params) {
        //TODO: We only support :params here, but that might be ok for now as we are constructing an url.
        var result = [];
        angular.forEach((url || '').split(':'), function (segment, i) {
            if (i == 0) {
                result.push(segment);
            } else {
                var segmentMatch = segment.match(/(\w+)(.*)/);
                var key = segmentMatch[1];
                result.push(params[key]);
                result.push(segmentMatch[2] || '');
                delete params[key];
            }
        });
        return result.join('');
    }

    function createRedirector(redirectTo: any): any {
        var fn = null;
        return function ($location, next) {
            if (fn === null) {
                if (redirectTo) {
                    if (angular.isString(redirectTo)) {
                        fn = function ($location, next) {
                            var interpolated = interpolate(redirectTo, next.params);
                            $location
                                .path(interpolated)
                                .search(next.params)
                                .replace();
                        };
                    } else {
                        fn = function ($location, next) {
                            $location
                                .url(redirectTo(next.pathParams, $location.path(), $location.search()))
                                .replace();
                        };
                    }
                } else {
                    fn = function () { };
                }
            }
            return fn($location, next);
        };
    }

    function createSegment(match: RegExpExecArray) {
        var cname = match[6] || '',
            carg = match[8],
            trimmed;

        if (carg) {
            trimmed = carg.trim();
            if (trimmed[0] === '{' && trimmed[trimmed.length - 1] === '}') {
                try {
                    carg = angular.fromJson(trimmed);
                } catch (e) {
                //Note: Errors are ok here, we let it remain as a string.
                }
            }
        }

        return {
            name: match[3] || match[9],
            converter: converters[cname](carg)
        }
    }

    var esc = /[-\/\\^$*+?.()|[\]{}]/g;
    function escape(exp: string) {
        return exp.replace(esc, "\\$&");
    }

    // NOTE: Hoisting brings the declaration (not assignment) of re to the top. I have left it here
    //       so it is only used in parseExpression, but defining it inside would case a new re on each
    //       call to parseExpression, and that is not needed.
    var re = new RegExp('\x2F((:(\\w+))|(\\{((\\w+)(\\((.*?)\\))?:)?(\\w+)\\}))', 'g');
    function parseExpression(path: string): IExpression {
        var regex = "^",
            segments = [],
            index = 0,
            match: RegExpExecArray,
            flags = '';

        if (path === '/') return {
            //partial: new RegExp('^[\x2F].*$', flags),
            complete: new RegExp('^[\x2F]$', flags),
            segments: []
        };

        while ((match = re.exec(path)) !== null) {
            regex += escape(path.slice(index, match.index));
            regex += '/([^\\/]*)';
            segments.push(createSegment(match));
            index = re.lastIndex;
        }
        regex += escape(path.substr(index));

        if (!caseSensitive) flags += 'i';
        if (regex[regex.length - 1] === '\x2F')
            regex = regex.substr(0, regex.length - 1);

        return {
            //partial: new RegExp(regex + "\x2F?.*$", flags),
            complete: new RegExp(regex + '\x2F?$', flags),
            segments: segments
        };
    }

    function normalizePath(path: string) {
        var name = "",
            index = 0,
            match: RegExpExecArray,
            counter = 0,
            params = {};

        if (path === null)
            return {
                name: null,
                params: params
            };

        while ((match = re.exec(path)) !== null) {
            var converter = match[6] || '',
                paramName = match[3] || match[9];

            params[paramName] = {
                id: counter,
                converter: converter
            };

            if (converter !== '') {
                converter = ":" + converter;
            }
            name += path.slice(index, match.index) + '/$' + (counter++) + converter;
            index = re.lastIndex;
        }
        name += path.substr(index);

        if (!caseSensitive)
            name = name.toLowerCase();

        return {
            name: name,
            params: params
        };
    }

    function createMatcher(path: string) {
        if (path == null)
            return (location: string) => { }

        var expFac = () => {
            var v = parseExpression(path);
            expFac = () => {
                return v;
            }
            return expFac();
        }

        return (location: string) => {
            var exp: IExpression = expFac(),
                match = location.match(exp.complete),
                dst = {},
                invalidParam;

            if (match) {

                //if (location.match(exp.complete)) {
                invalidParam = false;
                angular.forEach(exp.segments, function (segment: ISegment, index) {
                    if (!invalidParam) {
                        var param = match[index + 1],
                            value = segment.converter(param);
                        if (angular.isDefined(value.accept)) {
                            if (!value.accept)
                                invalidParam = true;
                            dst[segment.name] = value.value;
                        } else {
                            if (!value)
                                invalidParam = true;
                            dst[segment.name] = param;
                        }

                    }
                });

                if (!invalidParam)
                    return dst;
                //} else {
                //TODO: Match nested routes
                //}
            }
        }
    }

    //Registration of Default Converters

    this.convert('num', () => {
        return (param) => {
            var accepts = !isNaN(param);
            return {
                accept: accepts,
                value: accepts ? Number(param) : 0
            };
        }
    });

    this.convert('regex', (arg) => {
        var exp,
            flags = '',
            regex;

        if (angular.isObject(arg) && angular.isDefined(arg.exp)) {
            exp = arg.exp;
            if (angular.isDefined(arg.flags))
                flags = arg.flags;

        } else if (angular.isString(arg) && arg.length > 0) {
            exp = arg;
        } else {
            throw new Error("The Regular-expression converter was not initialized with a valid object.");
        }

        regex = new RegExp(exp, flags);
        return (param) => {
            var accepts = regex.test(param);
            return {
                accept: accepts,
                value: accepts ? regex.exec(param) : null
            };
        }
    });

    this.convert('', () => { return (param) => { return true; }; });

    //Service Factory

    this.$get = [<any>'$rootScope', '$location', '$q', '$injector', '$routeParams',
    function ($rootScope: ng.IRootScopeService, $location: ng.ILocationService, $q: ng.IQService, $injector: ng.auto.IInjectorService, $routeParams) {
        var forceReload = false,
            $route: any = {
                routes: routes,
                reload: function () {
                    forceReload = true;
                    $rootScope.$evalAsync(update);
                }
            };

        $rootScope.$on('$locationChangeSuccess', update);
        return $route;

        function buildmatch(route, params, search) {
            var match = inherit(route, {
                self: inherit(route.self, {
                    params: extend({}, search, params),
                    pathParams: params
                })
            });
            return match;
        }

        function findroute(currentPath) {
            var params,
                match;

            angular.forEach(routes, (route: IRoute, path: string) => {
                if (!match && (params = route.match(currentPath))) {
                    match = buildmatch(route, params, $location.search());
                }
            });

            return match || routes[<any>null] && buildmatch(routes[<any>null], {}, {});
        }

        function update() {
            var next = findroute($location.path()),
                lastRoute = $route.current,
                nextRoute = next ? next.self : undefined;

            if (!forceReload
                && nextRoute
                && lastRoute
                && angular.equals(nextRoute.pathParams, lastRoute.pathParams)
                && !nextRoute.reloadOnSearch) {

                lastRoute.params = next.params;
                angular.copy(nextRoute.params, $routeParams);
                $rootScope.$broadcast('$routeUpdate', lastRoute);
            } else if (next || lastRoute) {
                //TODO: We should always have a next to go to, it may be a null route though.

                forceReload = false;
                var event = $rootScope.$broadcast('$routeChangeStart', nextRoute, lastRoute);
                if (!event.defaultPrevented) {
                    $route.current = nextRoute;

                    if (next) next.redirect($location, nextRoute);

                    var dp: ng.IPromise = $q.when(nextRoute);
                    if (nextRoute) {
                        angular.forEach(decorators, (decorator, name) => {
                            dp = dp.then(() => {
                                var decorated = $injector.invoke(decorator, nextRoute, { $next: nextRoute });
                                return $q.when(decorated);
                            });
                        });
                    }
                    dp.then(() => {
                        if (nextRoute === $route.current) {
                            if (next) angular.copy(nextRoute.params, $routeParams);
                            $rootScope.$broadcast('$routeChangeSuccess', nextRoute, lastRoute);
                        }
                    }, (error) => {
                        if (nextRoute === $route.current) {
                            $rootScope.$broadcast('$routeChangeError', nextRoute, lastRoute, error);
                        }
                    });
                } else {
                    //TODO: Do we need to do anything if the user cancels?
                    //       - if the user wants to return to the old url, he should cancel on
                    //         location change instead?
                }
            }
        }
    }];
}
angular.module('ui.routing').provider('$route', $RouteProvider)
       .value('$routeParams', {});