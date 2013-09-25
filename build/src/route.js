/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
'use strict';
/**
* @ngdoc object
* @name dotjem.routing.$routeProvider
*
* @description
* Used for configuring routes. See {@link dotjem.routing.$route $route} for an example.
*/
function $RouteProvider() {
    var _this = this;
    var routes = {
    }, converters = {
    }, decorators = {
    }, caseSensitive = true;
    //Public Methods
    /**
    * @ngdoc method
    * @name dotjem.$routeProvider#convert
    * @methodOf dotjem.routing.$routeProvider
    *
    * @param {string} name Cerverter name, used in the path when registering routes through the
    *   {@link dotjem.routing.routeProvider#when when} function.
    *
    * @return {Object} self
    *
    * @description
    * Adds a new converter or overwrites an existing one.
    *
    * By default the folowing converters are precent:
    *  - `` - default Converter, used on all parameters that doesn't specify a converter.
    *    Matches any input.
    *
    *  - `num` - number converter, used to only mach numeric values.
    *
    *  - `regex` - regular expressions converter, used to match a parameter agains a regular
    *    expression.
    */
    this.convert = function (name, converter) {
        //Note: We wan't to allow overwrite
        converters[name] = converter;
        return _this;
    };
    /**
    * @ngdoc method
    * @name dotjem.$routeProvider#when
    * @methodOf dotjem.routing.$routeProvider
    *
    * @param {string} path Route path (matched against `$location.path`). If `$location.path`
    *    contains redundant trailing slash or is missing one, the route will still match.
    *
    *    `path` can contain named groups starting with a colon (`:name`) or curly brackets (`{name}`).
    *    All characters up to the next slash are matched and stored in `$routeParams` under the
    *    given `name` when the route matches.
    *
    *    Further, when using the curly bracket syntax, converters can be used to match only specific
    *    values, (`{num:name}`) will only match numerical values and (`{regex(\d{1,2}[a-z]+):name}`)
    *    would only match a parameter starting with one or two digits followed by a number of
    *    characters between 'a' and 'z'.
    *
    *    More converters can be registered using the {@link dotjem.routing.routeProvider#convert convert}
    *    function.
    *
    *    In addition to converters, it is possible to allow a parameter to catch all for both the old and new
    *    using an asterisk just before the parameter name, like:  (`:*name`) and (`{*name}`)
    *    or with converters (`array:*name}`) and (`contains(substring):*name}`).
    *    (Note: `array` and `contains` are not exist in the source and was purely for demonstration purposes)
    *
    * @param {Object} route Mapping information to be assigned to `$route.current` on route
    *    match.
    *
    *    Object properties:
    *
    *    - `state` `{string}` - a state that should be activated when the route is matched.
    *    - `action` `{string|function()=}` - an action that should be performed when the route is matched.
    *    - `redirectTo` `{string|function()=}` - value to update
    *      {@link ng.$location $location} path with and trigger route redirection.
    *
    *      If `redirectTo` is a function, it will be called with the following parameters:
    *
    *      - `{Object.<string>}` - route parameters extracted from the current
    *        `$location.path()` by applying the current route templateUrl.
    *      - `{string}` - current `$location.path()`
    *      - `{Object}` - current `$location.search()`
    *
    *      The custom `redirectTo` function is expected to return a string which will be used
    *      to update `$location.path()` and `$location.search()`.
    *
    *    - `[reloadOnSearch=true]` - {boolean=} - reload route when only $location.search()
    *    changes.
    *
    *      If the option is set to `false` and url in the browser changes, then
    *      `$routeUpdate` event is broadcasted on the root scope.
    *
    * @returns {Object} self
    *
    * @description
    * Adds a new route definition to the `$route` service.
    */
    this.when = function (path, route) {
        var expression = parseExpression(path);
        routes[expression.name] = {
            self: extend({
                reloadOnSearch: true
            }, route),
            redirect: createRedirector(route.redirectTo),
            match: createMatcher(path, expression),
            params: expression.params,
            path: path
        };
        return {
            convert: _this.convert,
            when: _this.when,
            otherwise: _this.otherwise,
            decorate: _this.decorate,
            ignoreCase: _this.ignoreCase,
            matchCase: _this.matchCase,
            $route: {
                name: expression.name,
                params: copy(expression.params),
                route: path
            }
        };
    };
    /**
    * @ngdoc method
    * @name dotjem.$routeProvider#otherwise
    * @methodOf dotjem.routing.$routeProvider
    *
    * @param {Object} params Mapping information to be assigned to `$route.current`.
    *
    * @return {Object} self
    *
    * @description
    * Sets route definition that will be used on route change when no other route definition
    * is matched.
    */
    this.otherwise = function (route) {
        _this.when(null, route);
        return _this;
    };
    /**
    * @ngdoc method
    * @name dotjem.$routeProvider#decorate
    * @methodOf dotjem.routing.$routeProvider
    *
    * @param {string} name A name for the decorator.
    * @param {function} decorator The decorator function.
    *
    * @return {Object} self
    *
    * @description
    * Allows for decorating a route just before the $routeChangeSuccess event is raised.
    */
    this.decorate = function (name, decorator) {
        //Note: We wan't to allow overwrite
        decorators[name] = decorator;
        return _this;
    };
    /**
    * @ngdoc method
    * @name dotjem.$routeProvider#ignoreCase
    * @methodOf dotjem.routing.$routeProvider
    *
    * @return {Object} self
    *
    * @description
    * Turns case insensitive matching on for routes defined after calling this method.
    */
    this.ignoreCase = function () {
        caseSensitive = false;
        return _this;
    };
    /**
    * @ngdoc method
    * @name dotjem.$routeProvider#matchCase
    * @methodOf dotjem.routing.$routeProvider
    *
    * @return {Object} self
    *
    * @description
    * Turns case sensitive matching on for routes defined after calling this method.
    */
    this.matchCase = function () {
        caseSensitive = true;
        return _this;
    };
    //Scoped Methods
    function createRedirector(redirectTo) {
        var fn = null;
        return function ($location, next) {
            if(fn === null) {
                if(redirectTo) {
                    if(isString(redirectTo)) {
                        fn = function ($location, next) {
                            var interpolated = interpolate(redirectTo, next.params);
                            $location.path(interpolated).search(next.params).replace();
                        };
                    } else {
                        fn = function ($location, next) {
                            $location.url(redirectTo(next.pathParams, $location.path(), $location.search())).replace();
                        };
                    }
                } else {
                    fn = function () {
                    };
                }
            }
            return fn($location, next);
        };
    }
    function createParameter(name, converter, cargs) {
        var trimmed;
        if(cargs) {
            trimmed = cargs.trim();
            if((trimmed[0] === '{' && trimmed[trimmed.length - 1] === '}') || (trimmed[0] === '[' && trimmed[trimmed.length - 1] === ']')) {
                try  {
                    cargs = angular.fromJson(trimmed);
                } catch (e) {
                    //Note: Errors are ok here, we let it remain as a string.
                                    }
            }
        }
        return {
            name: name,
            converter: function () {
                return converters[converter](cargs);
            }
        };
    }
    function interpolate(url, params) {
        //TODO: Are we missing calls to some "Encode URI component"?
                var name = "", index = 0;
        forEach(parseParams(url), function (param) {
            var formatter = function (val) {
                return val.toString();
            }, converter = createParameter(param.name, param.converter, param.args).converter();
            if(!isFunction(converter) && isDefined(converter.format)) {
                formatter = converter.format;
            }
            name += url.slice(index, param.index) + '/' + formatter(params[param.name]);
            index = param.lastIndex;
            delete params[param.name];
        });
        name += url.substr(index);
        return name;
    }
    var esc = /[-\/\\^$*+?.()|[\]{}]/g;
    function escape(exp) {
        return exp.replace(esc, "\\$&");
    }
    var paramsRegex = new RegExp('\x2F((:(\\*?)(\\w+))|(\\{((\\w+)(\\((.*?)\\))?:)?(\\*?)(\\w+)\\}))', 'g');
    function parseParams(path) {
        var match, params = [];
        if(path === null) {
            return params;
        }
        while((match = paramsRegex.exec(path)) !== null) {
            params.push({
                name: match[4] || match[11],
                catchAll: (match[3] || match[10]) === '*',
                converter: match[7] || '',
                args: match[9],
                index: match.index,
                lastIndex: paramsRegex.lastIndex
            });
        }
        return params;
    }
    function parseExpression(path) {
        var regex = "^", name = "", segments = [], index = 0, flags = '', params = {
        };
        if(path === null) {
            return {
                name: null,
                params: params
            };
        }
        if(path === '/') {
            return {
                exp: new RegExp('^[\x2F]?$', flags),
                segments: [],
                name: name,
                params: params
            };
        }
        forEach(parseParams(path), function (param, idx) {
            var cname = '';
            regex += escape(path.slice(index, param.index));
            if(param.catchAll) {
                regex += '/(.*)';
            } else {
                regex += '/([^\\/]*)';
            }
            if(param.converter !== '') {
                cname = ":" + param.converter;
            }
            name += path.slice(index, param.index) + '/$' + idx + cname;
            params[param.name] = {
                id: idx,
                converter: param.converter
            };
            segments.push(createParameter(param.name, param.converter, param.args));
            index = param.lastIndex;
        });
        regex += escape(path.substr(index));
        name += path.substr(index);
        if(!caseSensitive) {
            name = name.toLowerCase();
            flags += 'i';
        }
        if(regex[regex.length - 1] === '\x2F') {
            regex = regex.substr(0, regex.length - 1);
        }
        return {
            exp: new RegExp(regex + '\x2F?$', flags),
            segments: segments,
            name: name,
            params: params
        };
    }
    function createMatcher(path, expression) {
        if(path == null) {
            return function (location) {
            };
        }
        return function (location) {
            var match = location.match(expression.exp), dst = {
            }, invalidParam;
            if(match) {
                invalidParam = false;
                forEach(expression.segments, function (segment, index) {
                    var param, value, converter;
                    if(!invalidParam) {
                        param = match[index + 1];
                        converter = segment.converter();
                        if(!isFunction(converter) && isDefined(converter.parse)) {
                            converter = converter.parse;
                        }
                        value = converter(param);
                        if(isDefined(value.accept)) {
                            if(!value.accept) {
                                invalidParam = true;
                            }
                            dst[segment.name] = value.value;
                        } else {
                            if(!value) {
                                invalidParam = true;
                            }
                            dst[segment.name] = param;
                        }
                    }
                });
                if(!invalidParam) {
                    return dst;
                }
            }
        };
    }
    //Registration of Default Converters
    this.convert('num', function () {
        return {
            parse: function (param) {
                var accepts = !isNaN(param);
                return {
                    accept: accepts,
                    value: accepts ? Number(param) : 0
                };
            },
            format: function (value) {
                if(isNaN(value)) {
                    throw new Error(errors.invalidNumericValue);
                }
                return value.toString();
            }
        };
    });
    this.convert('regex', function (arg) {
        var exp, flags = '', regex;
        if(isObject(arg) && isDefined(arg.exp)) {
            exp = arg.exp;
            if(isDefined(arg.flags)) {
                flags = arg.flags;
            }
        } else if(isString(arg) && arg.length > 0) {
            exp = arg;
        } else {
            throw Error(errors.regexConverterNotValid);
        }
        regex = new RegExp(exp, flags);
        return {
            parse: function (param) {
                var accepts = regex.test(param);
                return {
                    accept: accepts,
                    value: accepts ? regex.exec(param) : null
                };
            },
            format: function (value) {
                var str = value.toString();
                var test = regex.test(str);
                if(!test) {
                    throw Error(errors.valueCouldNotBeMatchedByRegex);
                }
                return str;
            }
        };
    });
    this.convert('', function () {
        return function () {
            return true;
        };
    });
    //Service Factory
    this.$get = [
        '$rootScope', 
        '$location', 
        '$q', 
        '$injector', 
        '$routeParams', 
        function ($rootScope, $location, $q, $injector, $routeParams) {
            /**
            * @ngdoc object
            * @name dotjem.routing.$route
            *
            * @requires $location
            * @requires $routeParams
            *
            * @property {Object} current Reference to the current route definition.
            *
            * @property {Array.<Object>} routes Array of all configured routes.
            *
            * @description
            * Is used for deep-linking URLs to states.
            * It watches `$location.url()` and tries to map the path to an existing route definition.
            *
            * You can define routes through {@link dotjem.routing.$routeProvider $routeProvider}'s API.
            */
            /**
            * @ngdoc event
            * @name dotjem.routing.$route#$routeChangeStart
            * @eventOf dotjem.routing.$route
            *
            * @eventType broadcast on root scope
            *
            * @description
            * Broadcasted before a route change. At this  point the route services starts
            * resolving all of the dependencies needed for the route change to occurs.
            *
            * @param {Object} angularEvent Synthetic event object.
            * @param {Route} next Future route information.
            * @param {Route} current Current route information.
            */
            /**
            * @ngdoc event
            * @name dotjem.routing.$route#$routeChangeSuccess
            * @eventOf dotjem.routing.$route
            *
            * @eventType broadcast on root scope
            *
            * @description
            * Broadcasted after a route dependencies are resolved.
            *
            * @param {Object} angularEvent Synthetic event object.
            * @param {Route} current Current route information.
            * @param {Route|Undefined} previous Previous route information, or undefined if current is first route entered.
            */
            /**
            * @ngdoc event
            * @name dotjem.routing.$route#$routeChangeError
            * @eventOf dotjem.routing.$route
            *
            * @eventType broadcast on root scope
            *
            * @description
            * Broadcasted if any of the resolve promises are rejected.
            *
            * @param {Object} angularEvent Synthetic event object.
            * @param {Route} current Current route information.
            * @param {Route} previous Previous route information.
            * @param {Object} rejection Rejection of the promise. Usually the error of the failed promise.
            */
            /**
            * @ngdoc event
            * @name dotjem.routing.$route#$routeUpdate
            * @eventOf dotjem.routing.$route
            *
            * @eventType broadcast on root scope
            *
            * @description
            * The `reloadOnSearch` property has been set to false.
            */
            /**
            * @ngdoc method
            * @name dotjem.routing.$route#reload
            * @methodOf dotjem.routing.$route
            *
            * @description
            * Causes `$route` service to reload the current route even if
            * {@link ng.$location $location} hasn't changed.
            *
            * As a result of that, {@link dotjem.routing.directive:jemView jemView}
            * creates new scope, reinstantiates the controller.
            */
            /**
            * @ngdoc method
            * @name dotjem.routing.$route#change
            * @methodOf dotjem.routing.$route
            *
            * @param {Object} args Object with details about the route change.
            * The route definition contains:
            *
            *   - `route` {string} The route to change to, can have parameters.
            *   - `params` {Object=} A parameter object with parameters to fill into the route.
            *   - `replace` {boolean=} - True if the route should replace the browser history entry, otherwise false.
            *
            * @description
            * Changes the route.
            *
            * As a result of that, changes the {@link ng.$location path}.
            */
            /**
            * @ngdoc method
            * @name dotjem.routing.$route#format
            * @methodOf dotjem.routing.$route
            *
            * @param {string} route Route to format.
            * @param {Object=} params Parameters to fill into the route.
            *
            * @return {string} An url generated from the provided parameters.
            *
            * @description
            * Formats the given provided route into an url.
            */
                        var forceReload = false, $route = {
                routes: routes,
                reload: function () {
                    forceReload = true;
                    $rootScope.$evalAsync(update);
                },
                change: function (args) {
                    var params = args.params || {
                    }, route = interpolate(args.route, params), loc = $location.path(route).search(params || {
                    });
                    if(args.replace) {
                        loc.replace();
                    }
                },
                format: function (route, params) {
                    var params = params || {
                    };
                    return interpolate(route, params) + toKeyValue(params, '?');
                }
            };
            $rootScope.$on('$locationChangeSuccess', update);
            return $route;
            function buildmatch(route, params, search) {
                var match = inherit(route, {
                    self: inherit(route.self, {
                        params: extend({
                        }, search, params),
                        searchParams: search,
                        pathParams: params
                    })
                });
                return match;
            }
            function findroute(currentPath) {
                var params, match;
                forEach(routes, function (route) {
                    if(!match && (params = route.match(currentPath))) {
                        match = buildmatch(route, params, $location.search());
                    }
                });
                return match || routes[null] && buildmatch(routes[null], {
                }, {
                });
            }
            function update() {
                var next = findroute($location.path()), lastRoute = $route.current, nextRoute = next ? next.self : undefined;
                if(!forceReload && nextRoute && lastRoute && angular.equals(nextRoute.pathParams, lastRoute.pathParams) && !nextRoute.reloadOnSearch) {
                    lastRoute.params = nextRoute.params;
                    lastRoute.searchParams = nextRoute.searchParams;
                    lastRoute.pathParams = nextRoute.pathParams;
                    copy(nextRoute.params, $routeParams);
                    $rootScope.$broadcast('$routeUpdate', lastRoute);
                } else if(next || lastRoute) {
                    //TODO: We should always have a next to go to, it may be a null route though.
                    forceReload = false;
                    var event = $rootScope.$broadcast('$routeChangeStart', nextRoute, lastRoute);
                    if(!event.defaultPrevented) {
                        $route.current = nextRoute;
                        if(next) {
                            next.redirect($location, nextRoute);
                        }
                        var dp = $q.when(nextRoute);
                        if(nextRoute) {
                            forEach(decorators, function (decorator) {
                                dp = dp.then(function () {
                                    //Note: must keep nextRoute as "this" context here.
                                    var decorated = $injector.invoke(decorator, nextRoute, {
                                        $next: nextRoute
                                    });
                                    return $q.when(decorated);
                                });
                            });
                        }
                        dp.then(function () {
                            if(nextRoute === $route.current) {
                                if(next) {
                                    angular.copy(nextRoute.params, $routeParams);
                                }
                                $rootScope.$broadcast('$routeChangeSuccess', nextRoute, lastRoute);
                            }
                        }, function (error) {
                            if(nextRoute === $route.current) {
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
        }    ];
}
angular.module('dotjem.routing').provider('$route', $RouteProvider).value('$routeParams', {
});
