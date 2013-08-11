/**
 * @license dotJEM Angular Routing
 * (c) 2012-2013 dotJEM (Jens Melgaard)
 * License: MIT
 *
 * @module angular-routing
 */
var dotjem;
(function(window, document, dotjem, undefined) {
/// <reference path="../lib/angular/angular-1.0.d.ts" />
/*jshint globalstrict:true*/
/*global angular:false*/
'use strict';
/**
* @ngdoc overview
* @name dotjem.routing
* @description
*
* Module that provides state based routing, deeplinking services and directives for angular apps.
*/
angular.module('dotjem.routing', []);
var isDefined = angular.isDefined, isUndefined = angular.isUndefined, isFunction = angular.isFunction, isString = angular.isString, isObject = angular.isObject, isArray = angular.isArray, forEach = angular.forEach, extend = angular.extend, copy = angular.copy, equals = angular.equals, element = angular.element;
function inherit(parent, extra) {
    return extend(new (extend(function () {
    }, {
        prototype: parent
    }))(), extra);
}
function toName(named) {
    return isString(named) ? named : named.$fullname || named.fullname;
}
function injectFn(arg) {
    if(isFunction(arg)) {
        return function (injector, locals) {
            return injector.invoke(arg, arg, locals);
        };
    } else if(isArray(arg)) {
        var fn = arg[arg.length - 1];
        return function (injector, locals) {
            return injector.invoke(arg, fn, locals);
        };
    }
    return null;
}
//TODO: Taken fom Angular core, copied as it wasn't registered in their API, and couln't figure out if it was
//      a function of thie angular object.
function toKeyValue(obj) {
    var parts = [];
    forEach(obj, function (value, key) {
        parts.push(encodeUriQuery(key, true) + (value === true ? '' : '=' + encodeUriQuery(value, true)));
    });
    return parts.length ? parts.join('&') : '';
}
/**
* We need our custom method because encodeURIComponent is too aggressive and doesn't follow
* http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
* segments:
*    segment       = *pchar
*    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
*    pct-encoded   = "%" HEXDIG HEXDIG
*    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
*    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
*                     / "*" / "+" / "," / ";" / "="
*/
//TODO: Taken fom Angular core, copied as it wasn't registered in their API, and couln't figure out if it was
//      a function of thie angular object.
function encodeUriSegment(val) {
    return encodeUriQuery(val, true).replace(/%26/gi, '&').replace(/%3D/gi, '=').replace(/%2B/gi, '+');
}
/**
* This method is intended for encoding *key* or *value* parts of query component. We need a custom
* method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
* encoded per http://tools.ietf.org/html/rfc3986:
*    query       = *( pchar / "/" / "?" )
*    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
*    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
*    pct-encoded   = "%" HEXDIG HEXDIG
*    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
*                     / "*" / "+" / "," / ";" / "="
*/
//TODO: Taken fom Angular core, copied as it wasn't registered in their API, and couln't figure out if it was
//      a function of thie angular object.
function encodeUriQuery(val, pctEncodeSpaces) {
    return encodeURIComponent(val).replace(/%40/gi, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
}
var errors = {
    routeCannotBeUndefined: 'Can not set route to undefined.',
    valueCouldNotBeMatchedByRegex: "Value could not be matched by the regular expression parameter.",
    regexConverterNotValid: "The Regular-expression converter was not initialized with a valid object.",
    invalidNumericValue: "Value was not acceptable for a numeric parameter.",
    invalidBrowserPathExpression: "Invalid path expression.",
    expressionOutOfBounds: "Expression out of bounds.",
    couldNotFindStateForPath: "Could find state for path."
};

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
    * @param {Object} route Mapping information to be assigned to `$route.current` on route
    *    match.
    *
    *    Object properties:
    *
    *    - `state` � `{string}` � a state that should be activated when the route is matched.
    *    - `action` � `{(string|function()=}` � an action that should be performed when the route is matched.
    *    - `redirectTo` � {(string|function())=} � value to update
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
                var result = [], name = "", index = 0;
        forEach(parseParams(url), function (param, idx) {
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
    var paramsRegex = new RegExp('\x2F((:(\\w+))|(\\{((\\w+)(\\((.*?)\\))?:)?(\\w+)\\}))', 'g');
    function parseParams(path) {
        var match, params = [];
        if(path === null) {
            return params;
        }
        while((match = paramsRegex.exec(path)) !== null) {
            params.push({
                name: match[3] || match[9],
                converter: match[6] || '',
                args: match[8],
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
            regex += '/([^\\/]*)';
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
        return function (param) {
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
                    return interpolate(route, params) + toKeyValue(params);
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
                forEach(routes, function (route, path) {
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
                    lastRoute.params = next.params;
                    lastRoute.searchParams = next.searchParams;
                    lastRoute.pathParams = next.pathParams;
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
                            forEach(decorators, function (decorator, name) {
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

/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
/**
* @ngdoc object
* @name dotjem.routing.$stateTransitionProvider
*
* @description
* Used for configuring states. See {@link dotjem.routing.$state $state} for an example.
*/
function $StateTransitionProvider() {
    'use strict';
    var root = {
        children: {
        },
        targets: {
        }
    }, validation = /^\w+(\.\w+)*(\.[*])?$/, _this = this;
    function alignHandler(obj) {
        var result = {
            handler: {
            }
        };
        if(isDefined(obj.to)) {
            result.to = obj.to;
        }
        if(isDefined(obj.from)) {
            result.from = obj.from;
        }
        if(isDefined(obj.handler)) {
            result.handler = obj.handler;
        }
        if(isDefined(obj.before) && isUndefined(result.handler.before)) {
            result.handler.before = obj.before;
        }
        if(isDefined(obj.between) && isUndefined(result.handler.between)) {
            result.handler.between = obj.between;
        }
        if(isDefined(obj.after) && isUndefined(result.handler.after)) {
            result.handler.after = obj.after;
        }
        return result;
    }
    /**
    * @ngdoc method
    * @name dotjem.routing.$stateTransitionProvider#onEnter
    * @methodOf dotjem.routing.$stateTransitionProvider
    *
    * @param {string|State|Array} state The state we are transitioning to.
    * @param {funtion|Object} onenter The handler to invoke when entering the state.
    *
    * @description
    */
    this.onEnter = function (state, onenter) {
        //TODO: Validation
        if(isObject(onenter)) {
            var aligned = alignHandler(onenter);
            this.transition(aligned.from || '*', state, aligned.handler);
        } else if(isFunction(onenter) || isArray(onenter)) {
            this.transition('*', state, onenter);
        }
    };
    /**
    * @ngdoc method
    * @name dotjem.routing.$stateTransitionProvider#onExit
    * @methodOf dotjem.routing.$stateTransitionProvider
    *
    * @param {string|State|Array} state The state we are transitioning from.
    * @param {funtion|Object} onexit The handler to invoke when entering the state.
    *
    * @description
    */
    this.onExit = function (state, onexit) {
        if(isObject(onexit)) {
            var aligned = alignHandler(onexit);
            this.transition(state, aligned.to || '*', aligned.handler);
        } else if(isFunction(onexit) || isArray(onexit)) {
            this.transition(state, '*', onexit);
        }
    };
    /**
    * @ngdoc method
    * @name dotjem.routing.$stateTransitionProvider#transition
    * @methodOf dotjem.routing.$stateTransitionProvider
    *
    * @param {string|State|Array} from The state we are transitioning from.
    * @param {string|State|Array} to The state we are transitioning to.
    * @param {funtion|Object} handler The handler to invoke when the transitioning occurs.
    *
    * @description
    */
    this.transition = function (from, to, handler) {
        var _this = this;
        var transition, regHandler;
        if(isArray(from)) {
            forEach(from, function (value) {
                _this.transition(value, to, handler);
            });
        } else if(isArray(to)) {
            forEach(to, function (value) {
                _this.transition(from, value, handler);
            });
        } else {
            from = toName(from);
            to = toName(to);
            // We ignore the situation where to and from are the same explicit state.
            // Reason to ignore is the array ways of registering transitions, it could easily happen that a fully named
            // state was in both the target and source array, and it would be a hassle for the user if he had to avoid that.
            if(to === from && to.indexOf('*') === -1) {
                return this;
            }
            validate(from, to);
            if(angular.isFunction(handler) || angular.isArray(handler)) {
                handler = {
                    between: handler
                };
            }
            transition = lookup(from);
            if(!(to in transition.targets)) {
                transition.targets[to] = [];
            }
            handler.name = from + ' -> ' + to;
            transition.targets[to].push(handler);
        }
        return this;
    };
    function validate(from, to) {
        var fromValid = validateTarget(from), toValid = validateTarget(to);
        if(fromValid && toValid) {
            // && from !== to
            return;
        }
        if(fromValid) {
            throw new Error("Invalid transition - to: '" + to + "'.");
        }
        if(toValid) {
            throw new Error("Invalid transition - from: '" + from + "'.");
        }
        //if (from === to && from.indexOf('*') === -1)
        //    throw new Error("Invalid transition - from and to can't be the same.");
        throw new Error("Invalid transition - from: '" + from + "', to: '" + to + "'.");
    }
    function validateTarget(target) {
        if(target === '*' || validation.test(target)) {
            return true;
        }
        return false;
    }
    function lookup(name) {
        var current = root, names = name.split('.'), i = //If name contains root explicitly, skip that one
        names[0] === 'root' ? 1 : 0;
        for(; i < names.length; i++) {
            if(!(names[i] in current.children)) {
                current.children[names[i]] = {
                    children: {
                    },
                    targets: {
                    }
                };
            }
            current = current.children[names[i]];
        }
        return current;
    }
    /**
    * @ngdoc object
    * @name dotjem.routing.$stateTransition
    *
    * @requires $q
    * @requires $injector
    *
    * @description
    *
    */
    this.$get = [
        '$q', 
        '$injector', 
        function ($q, $injector) {
            /**
            * @ngdoc method
            * @name dotjem.routing.$stateTransition#find
            * @methodOf dotjem.routing.$stateTransition
            *
            * @param {string|State|Array} from The state we are transitioning from.
            * @param {string|State|Array} to The state we are transitioning to.
            *
            * @description
            */
            var $transition = {
                root: root,
                find: find
            };
            return $transition;
            function find(from, to) {
                var transitions = findTransitions(toName(from)), handlers = extractHandlers(transitions, toName(to)), emitters;
                function emit(select, tc) {
                    var handler;
                    forEach(handlers, function (handlerObj) {
                        if(isDefined(handler = select(handlerObj))) {
                            injectFn(handler)($injector, {
                                $to: to,
                                $from: from,
                                $transition: tc
                            });
                        }
                    });
                }
                return {
                    before: function (tc) {
                        emit(function (h) {
                            return h.before;
                        }, tc);
                    },
                    between: function (tc) {
                        emit(function (h) {
                            return h.between;
                        }, tc);
                    },
                    after: function (tc) {
                        emit(function (h) {
                            return h.after;
                        }, tc);
                    }
                };
            }
            function trimRoot(path) {
                if(path[0] === 'root') {
                    path.splice(0, 1);
                }
                return path;
            }
            function compare(one, to) {
                var left = trimRoot(one.split('.')).reverse(), right = trimRoot(to.split('.')).reverse(), l, r, i = 0;
                while(true) {
                    l = left.pop();
                    r = right.pop();
                    if(r === '*' || l === '*') {
                        return true;
                    }
                    if(l !== r) {
                        return false;
                    }
                    if(!isDefined(l) || !isDefined(r)) {
                        return true;
                    }
                }
                return true;
            }
            function extractHandlers(transitions, to) {
                var handlers = [];
                forEach(transitions, function (t) {
                    forEach(t.targets, function (target, targetName) {
                        if(compare(targetName, to)) {
                            forEach(target, function (value) {
                                handlers.push(value);
                            });
                        }
                    });
                });
                return handlers;
            }
            function findTransitions(from) {
                var current = root, names = from.split('.'), transitions = [], index = names[0] === 'root' ? 1 : 0;
                do {
                    if('*' in current.children) {
                        transitions.push(current.children['*']);
                    }
                    if(names[index] in current.children) {
                        current = current.children[names[index]];
                        transitions.push(current);
                    } else {
                        break;
                    }
                }while(index++ < names.length);
                return transitions;
            }
        }    ];
}
angular.module('dotjem.routing').provider('$stateTransition', $StateTransitionProvider);

/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
/// <reference path="state/state.ts" />
/// <reference path="state/stateFactory.ts" />
/// <reference path="state/stateRules.ts" />
/// <reference path="state/stateComparer.ts" />
/// <reference path="state/stateBrowser.ts" />
/// <reference path="state/stateUrlBuilder.ts" />
/**
* @ngdoc object
* @name dotjem.routing.$stateProvider
*
* @description
* Used for configuring states. See {@link dotjem.routing.$state $state} for an example.
*/
var $StateProvider = [
    '$routeProvider', 
    '$stateTransitionProvider', 
    function ($routeProvider, $transitionProvider) {
        'use strict';
        //TODO: maybe create a stateUtilityProvider that can serve as a factory for all these helpers.
        //      it would make testing of them individually easier, although it would make them more public than
        //      they are right now.
                var factory = new StateFactory($routeProvider, $transitionProvider), root = factory.createState('root', {
        }), browser = new StateBrowser(root), comparer = new StateComparer();
        /**
        * @ngdoc method
        * @name dotjem.$stateProvider#state
        * @methodOf dotjem.routing.$stateProvider
        *
        * @param {string} fullname Full name of the state, use '.' to seperate parent and child states.
        *
        * E.g. if the full name "home" is given, the state is directly located under the root.
        * It then becomes possible to register "home.recents" as a child named "recents" under the state "home".
        *
        * The following registrations would result in the ilustated hierachy.
        *
        * `.state('home', {})`
        * `.state('home.recents', {})`
        * `.state('home.all', {})`
        * `.state('staff', {})`
        * `.state('staff.all', {})`
        * `.state('staff.single', {})`
        *
        *   - home
        *     - recents
        *     - all
        *   - staff
        *     - all
        *     - single
        *
        * @param {Object} state All information about the state.
        *
        *    Object properties:
        *
        * - `views`: `{Object}` A list og views to be updated when the state is activated.
        * - `route`: `{string}` A route to associate the state with,
        *   this will be registered with the {@link dotjem.routing.$routeProvider $routeProvider}
        * - `onEnter`: `{string|function|Object}` value
        * - `onExit`: `{string|function|Object}` value
        * - `reloadOnSearch`: `{bool}` If associated with a route, should that route reload on search.
        * - `scrollTo`: {string=} � A element to scroll to when the state has been loaded.
        *
        * @returns {Object} self
        *
        * @description
        * Adds a new route definition to the `$route` service.
        */
        this.state = function (fullname, state) {
            StateRules.validateName(fullname);
            var parent = browser.lookup(fullname, 1);
            parent.add(factory.createState(fullname, state, parent));
            return this;
        };
        this.$get = [
            '$rootScope', 
            '$q', 
            '$injector', 
            '$route', 
            '$view', 
            '$stateTransition', 
            '$location', 
            '$scroll', 
            function ($rootScope, $q, $injector, $route, $view, $transition, $location, $scroll) {
                /**
                * @ngdoc object
                * @name dotjem.routing.$state
                *
                * @requires $rootScope
                * @requires $q
                * @requires $injector
                * @requires $route
                * @requires $view
                * @requires $stateTransition
                * @requires $location
                * @requires $scroll
                *
                * @property {Object} current Reference to the current state loaded.
                *
                * @description
                *
                * You can define states through {@link dotjem.routing.$stateProvider $stateProvider}'s API.
                */
                /**
                * @ngdoc event
                * @name dotjem.routing.$state#$stateChangeStart
                * @eventOf dotjem.routing.$state
                *
                * @eventType broadcast on root scope
                *
                * @description
                * Broadcasted before a route change. At this  point the route services starts
                * resolving all of the dependencies needed for the route change to occurs.
                *
                * @param {Object} angularEvent Synthetic event object.
                * @param {State} next Future state.
                * @param {State} current Current state.
                */
                /**
                * @ngdoc event
                * @name dotjem.routing.$state#$stateChangeSuccess
                * @eventOf dotjem.routing.$state
                *
                * @eventType broadcast on root scope
                *
                * @description
                * Broadcasted after a route dependencies are resolved.
                *
                * @param {Object} angularEvent Synthetic event object.
                * @param {State} next Future state.
                * @param {State} current Current state.
                */
                /**
                * @ngdoc event
                * @name dotjem.routing.$state#$stateChangeError
                * @eventOf dotjem.routing.$state
                *
                * @eventType broadcast on root scope
                *
                * @description
                * Broadcasted if any of the resolve promises are rejected.
                *
                * @param {Object} angularEvent Synthetic event object.
                * @param {State} next Future state.
                * @param {State} current Current state.
                * @param {Object} rejection Rejection of the promise. Usually the error of the failed promise.
                */
                /**
                * @ngdoc event
                * @name dotjem.routing.$state#$stateUpdate
                * @eventOf dotjem.routing.$state
                *
                * @eventType broadcast on root scope
                *
                * @description
                */
                /**
                * @ngdoc method
                * @name dotjem.routing.$state#goto
                * @methodOf dotjem.routing.$state
                *
                * @param {State|string} state Current state.
                * @param {Object} params Current state.
                *
                * @description
                * Goes to the specified state,
                */
                /**
                * @ngdoc method
                * @name dotjem.routing.$state#lookup
                * @methodOf dotjem.routing.$state
                *
                * @param {string} path Expression to resolve or the full name of a state.
                *
                * @description
                * Finds a state based on the provided expression or name.
                */
                /**
                * @ngdoc method
                * @name dotjem.routing.$state#reload
                * @methodOf dotjem.routing.$state
                *
                * @param {State|string|boolean=} state Name or State in the current hierachy or true/false
                *
                * @description
                * Reloads the state and associated views.
                */
                /**
                * @ngdoc method
                * @name dotjem.routing.$state#url
                * @methodOf dotjem.routing.$state
                *
                * @param {State|string=} state A state to generate an URL for
                * @param {Object=} params A set of parameters to use when generating the url
                *
                * @description
                * An url generated from the provided parameters.
                */
                var urlbuilder = new StateUrlBuilder($route);
                var forceReload = null, current = root, currentParams = {
                }, $state = {
                    root: // NOTE: root should not be used in general, it is exposed for testing purposes.
                    root,
                    current: extend({
                    }, root.self),
                    goto: function (state, params) {
                        goto({
                            state: state,
                            params: {
                                all: params
                            },
                            updateroute: true
                        });
                    },
                    lookup: function (path) {
                        return browser.resolve(current, path);
                    },
                    reload: reload,
                    url: function (state, params) {
                        state = isDefined(state) ? browser.lookup(toName(state)) : current;
                        return urlbuilder.buildUrl($state.current, state, params);
                    }
                };
                $rootScope.$on('$routeChangeSuccess', function () {
                    var route = $route.current, params;
                    if(route) {
                        params = {
                            all: route.params,
                            path: route.pathParams,
                            search: route.searchParams
                        };
                        if(route.state) {
                            goto({
                                state: route.state,
                                params: params,
                                route: route
                            });
                        }
                    } else {
                        goto({
                            state: root
                        });
                    }
                });
                $rootScope.$on('$routeUpdate', function () {
                    var route = $route.current;
                    raiseUpdate(route.params, route.pathParams, route.searchParams);
                });
                return $state;
                function reload(state) {
                    if(isDefined(state)) {
                        if(isString(state) || isObject(state)) {
                            forceReload = toName(state);
                            //TODO: We need some name normalization OR a set of "compare" etc methods that can ignore root.
                            if(forceReload.indexOf('root') !== 0) {
                                forceReload = 'root.' + forceReload;
                            }
                        } else if(state) {
                            forceReload = root.fullname;
                        }
                    } else {
                        forceReload = current.fullname;
                    }
                    $rootScope.$evalAsync(function () {
                        goto({
                            state: current,
                            params: currentParams,
                            route: $route.current
                        });
                    });
                }
                function raiseUpdate(all, path, search) {
                    var dst = $state.current.$params;
                    dst.all = all;
                    dst.path = path;
                    dst.search = search;
                    $rootScope.$broadcast('$stateUpdate', $state.current);
                }
                function goto(args) {
                    //TODO: This list of declarations seems to indicate that we are doing more that we should in a single function.
                    //      should try to refactor it if possible.
                                        var params = args.params, route = args.route, to = browser.lookup(toName(args.state)), toState = // lookupState(toName(args.state)),
                    extend({
                    }, to.self, {
                        $params: params,
                        $route: route
                    }), fromState = $state.current, emit = $transition.find($state.current, toState), cancel = false, transaction, scrollTo, changed = comparer.compare(browser.lookup(toName($state.current)), to, fromState.$params && fromState.$params.all, params && params.all || {
                    }, forceReload), transition = {
                        cancel: function () {
                            cancel = true;
                        },
                        goto: function (state, params) {
                            cancel = true;
                            goto({
                                state: state,
                                params: {
                                    all: params
                                },
                                updateroute: true
                            });
                        }
                    };
                    if(!forceReload && !changed.stateChanges) {
                        if(changed.paramChanges) {
                            raiseUpdate(params.all || {
                            }, params.path || {
                            }, params.search || {
                            });
                        }
                        return;
                    }
                    forceReload = null;
                    if(args.updateroute && to.route) {
                        //TODO: This is very similar to what we do in buildStateArray -> extractParams,
                        //      maybe we can refactor those together
                                                var paramsObj = {
                        }, allFrom = (fromState.$params && fromState.$params.all) || {
                        };
                        forEach(to.route.params, function (param, name) {
                            if(name in allFrom) {
                                paramsObj[name] = allFrom[name];
                            }
                        });
                        var mergedParams = extend(paramsObj, (params && params.all));
                        $route.change(extend({
                        }, to.route, {
                            params: mergedParams
                        }));
                        return;
                    }
                    emit.before(transition);
                    if(cancel) {
                        //TODO: Should we do more here?... What about the URL?... Should we reset that to the privous URL?...
                        //      That is if this was even triggered by an URL change in the first place.
                        return;
                    }
                    var event = $rootScope.$broadcast('$stateChangeStart', toState, fromState);
                    if(!event.defaultPrevented) {
                        $q.when(toState).then(function () {
                            var useUpdate = false, locals = {
                            }, promises = [];
                            transaction = $view.beginUpdate();
                            $view.clear();
                            function resolve(args) {
                                var values = [], keys = [];
                                angular.forEach(args || {
                                }, function (value, key) {
                                    keys.push(key);
                                    values.push(angular.isString(value) ? $injector.get(value) : $injector.invoke(value));
                                });
                                var def = $q.defer();
                                $q.all(values).then(function (values) {
                                    angular.forEach(values, function (value, index) {
                                        locals[keys[index]] = value;
                                    });
                                    def.resolve(locals);
                                });
                                return def.promise;
                            }
                            var promise = $q.when(0);
                            forEach(changed.array, function (change, index) {
                                promise = promise.then(function () {
                                    return resolve(change.state.resolve);
                                }).then(function (locals) {
                                    if(change.isChanged) {
                                        useUpdate = true;
                                    }
                                    scrollTo = change.state.scrollTo;
                                    forEach(change.state.views, function (view, name) {
                                        var sticky, fn;
                                        if(view.sticky) {
                                            sticky = view.sticky;
                                            if((fn = injectFn(sticky)) != null) {
                                                sticky = fn($injector, {
                                                    $to: toState,
                                                    $from: fromState
                                                });
                                            } else if(!isString(sticky)) {
                                                sticky = change.state.fullname;
                                            }
                                        }
                                        if(useUpdate || isDefined(sticky)) {
                                            $view.setOrUpdate(name, view.template, view.controller, copy(locals), sticky);
                                        } else {
                                            $view.setIfAbsent(name, view.template, view.controller, copy(locals));
                                        }
                                    });
                                });
                            });
                            return promise.then(function () {
                                emit.between(transition);
                                if(cancel) {
                                    transaction.cancel();
                                    //TODO: Should we do more here?... What about the URL?... Should we reset that to the privous URL?...
                                    //      That is if this was even triggered by an URL change in teh first place.
                                    return;
                                }
                                current = to;
                                currentParams = params;
                                $state.current = toState;
                                transaction.commit();
                                $rootScope.$broadcast('$stateChangeSuccess', toState, fromState);
                            });
                        }, function (error) {
                            transaction.cancel();
                            $rootScope.$broadcast('$stateChangeError', toState, fromState, error);
                        }).then(function () {
                            if(!cancel) {
                                transition.cancel = function () {
                                    throw Error("Can't cancel transition in after handler");
                                };
                                emit.after(transition);
                                $scroll(scrollTo);
                            }
                            //Note: nothing to do here.
                                                    });
                    }
                }
            }        ];
    }];
angular.module('dotjem.routing').provider('$state', $StateProvider);

/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../common.ts" />
/// <reference path="../interfaces.d.ts" />
/// <reference path="stateRules.ts" />
/// <reference path="stateFactory.ts" />
var State = (function () {
    function State(_name, _fullname, _self, _parent) {
        this._name = _name;
        this._fullname = _fullname;
        this._parent = _parent;
        this._children = {
        };
        this._self = _self;
        this._self.$fullname = _fullname;
        this._reloadOnOptional = !isDefined(_self.reloadOnSearch) || _self.reloadOnSearch;
        this._scrollTo = this._self.scrollTo || _parent && _parent.scrollTo || 'top';
    }
    Object.defineProperty(State.prototype, "children", {
        get: function () {
            return this._children;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(State.prototype, "fullname", {
        get: function () {
            return this._fullname;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(State.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(State.prototype, "reloadOnOptional", {
        get: function () {
            return this._reloadOnOptional;
        },
        set: function (value) {
            this._reloadOnOptional = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(State.prototype, "self", {
        get: function () {
            return copy(this._self);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(State.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(State.prototype, "route", {
        get: function () {
            return this._route;
        },
        set: function (value) {
            if(isUndefined(value)) {
                throw Error(errors.routeCannotBeUndefined);
            }
            this._route = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(State.prototype, "root", {
        get: function () {
            if(this.parent === null) {
                return this;
            }
            return this._parent.root;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(State.prototype, "scrollTo", {
        get: function () {
            return this._scrollTo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(State.prototype, "views", {
        get: function () {
            return this.self.views;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(State.prototype, "resolve", {
        get: function () {
            return this.self.resolve;
        },
        enumerable: true,
        configurable: true
    });
    State.prototype.add = function (child) {
        this._children[child.name] = child;
        return this;
    };
    State.prototype.resolveRoute = function () {
        return isDefined(this.route) ? this.route.route : isDefined(this.parent) ? this.parent.resolveRoute() : '';
    };
    return State;
})();

/// <reference path="state.ts" />
var StateBrowser = (function () {
    function StateBrowser(root) {
        this.root = root;
        this.nameRegex = new RegExp('^\\w+(\\.\\w+)+$');
        this.siblingRegex = new RegExp('^\\$node\\(([-+]?\\d+)\\)$');
        this.indexRegex = new RegExp('^\\[(-?\\d+)\\]$');
    }
    StateBrowser.prototype.lookup = function (fullname, stop) {
        var current = this.root, names = fullname.split('.'), i = names[0] === 'root' ? 1 : 0, stop = isDefined(stop) ? stop : 0;
        for(; i < names.length - stop; i++) {
            if(!(names[i] in current.children)) {
                throw Error("Could not locate '" + names[i] + "' under '" + current.fullname + "'.");
            }
            current = current.children[names[i]];
        }
        return current;
    };
    StateBrowser.prototype.resolve = function (origin, path) {
        var _this = this;
        var siblingSelector = this.siblingRegex.exec(path), nameSelector = // path.match(this.siblingRegex),
        this.nameRegex.test(path), selected = origin, sections;
        if(siblingSelector) {
            selected = this.selectSibling(Number(siblingSelector[1]), selected);
        } else if(this.nameRegex.test(path)) {
            //Note: This enables us to select a state using a full name rather than a select expression.
            //      but as a special case, the "nameRegex" will not match singular names as 'statename'
            //      because that is also a valid relative lookup.
            //
            //      instead we force the user to use '/statename' if he really wanted to look up a state
            //      from the root.
            selected = this.lookup(path);
        } else {
            sections = path.split('/');
            forEach(sections, function (sec) {
                selected = _this.select(origin, sec, selected);
            });
        }
        if(selected === this.root) {
            throw Error(errors.expressionOutOfBounds);
        }
        return selected && extend({
        }, selected.self) || undefined;
    };
    StateBrowser.prototype.selectSibling = function (index, selected) {
        var children = [], currentIndex;
        forEach(selected.parent.children, function (child) {
            children.push(child);
            if(selected.fullname === child.fullname) {
                currentIndex = children.length - 1;
            }
        });
        while(index < 0) {
            index += children.length;
        }
        index = (currentIndex + index) % children.length;
        return children[index];
    };
    StateBrowser.prototype.select = function (origin, exp, selected) {
        if(exp === '.') {
            if(origin !== selected) {
                throw Error(errors.invalidBrowserPathExpression);
            }
            return selected;
        }
        if(exp === '..') {
            if(isUndefined(selected.parent)) {
                throw Error(errors.expressionOutOfBounds);
            }
            return selected.parent;
        }
        if(exp === '') {
            if(origin !== selected) {
                throw Error(errors.invalidBrowserPathExpression);
            }
            return this.root;
        }
        var match = this.indexRegex.exec(exp);// exp.match(this.indexRegex);
        
        if(match) {
            var index = Number(match[1]), children = [];
            forEach(selected.children, function (child) {
                children.push(child);
            });
            if(Math.abs(index) >= children.length) {
                throw Error(errors.expressionOutOfBounds);
            }
            return index < 0 ? children[children.length + index] : children[index];
        }
        if(exp in selected.children) {
            return selected.children[exp];
        }
        throw Error(errors.couldNotFindStateForPath);
    };
    return StateBrowser;
})();

/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../common.ts" />
/// <reference path="../interfaces.d.ts" />
/// <reference path="state.ts" />
var StateComparer = (function () {
    function StateComparer() { }
    StateComparer.prototype.buildStateArray = function (state, params) {
        function extractParams() {
            var paramsObj = {
            };
            if(current.route) {
                forEach(current.route.params, function (param, name) {
                    paramsObj[name] = params[name];
                });
            }
            return paramsObj;
        }
        var states = [], current = state;
        do {
            states.push({
                state: current,
                params: extractParams()
            });
        }while(current = current.parent);
        return states;
    };
    StateComparer.prototype.compare = function (from, to, fromParams, toParams, forceReload) {
        var fromArray = this.buildStateArray(from, fromParams || {
        }), toArray = this.buildStateArray(to, toParams), count = Math.max(fromArray.length, toArray.length), fromAtIndex, toAtIndex, c, stateChanges = false, paramChanges = !equals(fromParams, toParams);
        for(var i = 0; i < count; i++) {
            fromAtIndex = fromArray[fromArray.length - i - 1];
            toAtIndex = toArray[toArray.length - i - 1];
            if(isUndefined(toAtIndex)) {
                toArray[0].isChanged = stateChanges = true;
            } else if(isUndefined(fromAtIndex) || (forceReload && forceReload == toAtIndex.state.fullname) || toAtIndex.state.fullname !== fromAtIndex.state.fullname || !equals(toAtIndex.params, fromAtIndex.params)) {
                toAtIndex.isChanged = stateChanges = true;
            } else {
                toAtIndex.isChanged = false;
            }
        }
        //TODO: if ReloadOnOptional is false, but parameters are changed.
        //      we should raise the update event instead.
        stateChanges = stateChanges || (toArray[0].state.reloadOnOptional && paramChanges);
        return {
            array: toArray.reverse(),
            stateChanges: stateChanges,
            paramChanges: paramChanges
        };
    };
    return StateComparer;
})();

/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../common.ts" />
/// <reference path="../interfaces.d.ts" />
/// <reference path="stateRules.ts" />
/// <reference path="state.ts" />
var StateFactory = (function () {
    function StateFactory(routes, transitions) {
        this.routes = routes;
        this.transitions = transitions;
    }
    StateFactory.prototype.createRoute = function (stateRoute, parentRoute, stateName, reloadOnSearch) {
        var route = parentRoute || '';
        if(route !== '' && route[route.length - 1] === '/') {
            route = route.substr(0, route.length - 1);
        }
        if(stateRoute[0] !== '/' && stateRoute !== '') {
            route += '/';
        }
        route += stateRoute;
        return this.routes.when(route, {
            state: stateName,
            reloadOnSearch: reloadOnSearch
        });
    };
    StateFactory.prototype.createState = function (fullname, state, parent) {
        var _this = this;
        var name = fullname.split('.').pop();
        if(isDefined(parent)) {
            fullname = parent.fullname + "." + name;
        }
        var stateObj = new State(name, fullname, state, parent);
        stateObj.reloadOnOptional = !isDefined(state.reloadOnSearch) || state.reloadOnSearch;
        if(isDefined(state.route)) {
            stateObj.route = this.createRoute(state.route, parent.resolveRoute(), stateObj.fullname, stateObj.reloadOnOptional).$route;
        }
        if(isDefined(state.onEnter)) {
            this.transitions.onEnter(stateObj.fullname, state.onEnter);
        }
        if(isDefined(state.onExit)) {
            this.transitions.onExit(stateObj.fullname, state.onExit);
        }
        if(isDefined(state.children)) {
            forEach(state.children, function (childState, childName) {
                stateObj.add(_this.createState(stateObj.fullname + '.' + childName, childState, stateObj));
            });
        }
        return stateObj;
    };
    return StateFactory;
})();

/// <reference path="state.ts" />
var StateRules = (function () {
    function StateRules() { }
    StateRules.nameValidation = /^\w+(\.\w+)*?$/;
    StateRules.validateName = function validateName(name) {
        if(StateRules.nameValidation.test(name)) {
            return;
        }
        throw new Error("Invalid name: '" + name + "'.");
    };
    return StateRules;
})();

/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../common.ts" />
/// <reference path="../interfaces.d.ts" />
/// <reference path="stateRules.ts" />
/// <reference path="stateBrowser.ts" />
/// <reference path="state.ts" />
var StateUrlBuilder = (function () {
    function StateUrlBuilder(route) {
        this.route = route;
    }
    StateUrlBuilder.prototype.buildUrl = function (current, target, params) {
        var c = current;
        if(!target.route) {
            throw new Error("Can't build url for a state that doesn't have a url defined.");
        }
        //TODO: Find parent with route and return?
        //TODO: This is very similar to what we do in buildStateArray -> extractParams,
        //      maybe we can refactor those together
                var paramsObj = {
        }, allFrom = (c && c.$params && c.$params.all) || {
        };
        forEach(target.route.params, function (param, name) {
            if(name in allFrom) {
                paramsObj[name] = allFrom[name];
            }
        });
        return this.route.format(target.route.route, extend(paramsObj, params || {
        }));
    };
    return StateUrlBuilder;
})();

/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
function $TemplateProvider() {
    'use strict';
    var urlmatcher = new RegExp('^(((http|https|ftp)://([\\w-\\d]+\\.)+[\\w-\\d]+){0,1}(/?[\\w~,;\\-\\./?%&+#=]*))', 'i');
    /**
    * @ngdoc object
    * @name dotjem.routing.$template
    *
    * @description
    *
    */
    this.$get = [
        '$http', 
        '$q', 
        '$injector', 
        '$templateCache', 
        function ($http, $q, $injector, $templateCache) {
            function getFromUrl(url) {
                return $http.get(url, {
                    cache: $templateCache
                }).then(function (response) {
                    return response.data;
                });
            }
            function getFromFunction(fn) {
                return $q.when($injector.invoke(fn));
            }
            function getFromObject(obj) {
                if(isDefined(obj.url)) {
                    return getFromUrl(obj.url);
                }
                if(isDefined(obj.fn)) {
                    return getFromFunction(obj.fn);
                }
                if(isDefined(obj.html)) {
                    return $q.when(obj.html);
                }
                throw new Error("Object must define url, fn or html.");
            }
            /**
            * @ngdoc method
            * @name dotjem.routing.$template#get
            * @methodOf dotjem.routing.$template
            *
            * @param {string|Object|function} template Either a string reprecenting the actual template,
            * an url to it, a function returning it or an object specifying a location of the template.
            *
            * If a template object i used, one of the following properties may be used:
            * - `url` `{string}`: An url location of the template.
            * - `fn` `{function}`: A function that returns the template.
            * - `html` `{string}`: The actual template as raw html.
            *
            * @returns {Promise} a promise that resolves to the template.
            *
            * @description
            *
            */
            this.get = function (template) {
                if(isString(template)) {
                    if(urlmatcher.test(template)) {
                        return getFromUrl(template);
                    } else {
                        return $q.when(template);
                    }
                }
                if(isFunction(template) || isArray(template)) {
                    return getFromFunction(template);
                }
                if(isObject(template)) {
                    return getFromObject(template);
                }
                throw new Error("Template must be either an url as string, function or a object defining either url, fn or html.");
            };
            return this;
        }    ];
}
angular.module('dotjem.routing').provider('$template', $TemplateProvider);

/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
function $ViewProvider() {
    'use strict';
    /**
    * @ngdoc object
    * @name dotjem.routing.$view
    *
    * @description
    *
    */
    this.$get = [
        '$rootScope', 
        '$q', 
        '$template', 
        function ($rootScope, $q, $template) {
            var views = {
            }, transaction = null;
            function ensureName(name) {
                if(name === 'undefined') {
                    throw new Error('Must define a view name.');
                }
            }
            ;
            function raiseUpdated(name) {
                $rootScope.$broadcast('$viewUpdate', name);
            }
            function raiseRefresh(name, data) {
                $rootScope.$broadcast('$viewRefresh', name, data);
            }
            function containsView(map, name) {
                return (name in map) && map[name] !== null;
            }
            /**
            * @ngdoc method
            * @name dotjem.$view#clear
            * @methodOf dotjem.routing.$view
            *
            * @param {string} name The name of the view to clear (optional)
            *
            * @description
            * Clears a view, or all views if no name is provided.
            */
            this.clear = function (name) {
                var _this = this;
                if(isUndefined(name)) {
                    forEach(views, function (val, key) {
                        _this.clear(key);
                    });
                } else {
                    if(transaction) {
                        transaction.records[name] = {
                            act: 'clear',
                            fn: function () {
                                _this.clear(name);
                            }
                        };
                        return;
                    }
                    delete views[name];
                    raiseUpdated(name);
                }
            };
            function isArgs(args) {
                return isObject(args) && (isDefined(args.template) || isDefined(args.controller) || isDefined(args.locals) || isDefined(args.sticky));
            }
            /**
            * @ngdoc method
            * @name dotjem.$view#setOrUpdate
            * @methodOf dotjem.routing.$view
            *
            * @param {string} name Name
            * @param {object} args Arguments
            *
            * @description
            *
            */
            /**
            * @ngdoc method
            * @name dotjem.$view#setOrUpdate
            * @methodOf dotjem.routing.$view
            *
            * @param {string} name Name
            * @param {object} template Template
            * @param {function=} controller Controller
            * @param {object=} locals Locals
            * @param {string=} sticky Sticky flag
            *
            * @description
            *
            */
            this.setOrUpdate = function (name, templateOrArgs, controller, locals, sticky) {
                var _this = this;
                var template = templateOrArgs;
                if(isArgs(templateOrArgs)) {
                    template = templateOrArgs.template;
                    controller = templateOrArgs.controller;
                    locals = templateOrArgs.locals;
                    sticky = templateOrArgs.sticky;
                }
                ensureName(name);
                if(transaction) {
                    transaction.records[name] = {
                        act: 'setOrUpdate',
                        fn: function () {
                            _this.setOrUpdate(name, template, controller, locals, sticky);
                        }
                    };
                    return;
                }
                if(!containsView(views, name)) {
                    views[name] = {
                        version: -1
                    };
                }
                //TODO: Should we make this latebound so only views actually used gets loaded and rendered?
                views[name].template = $template.get(template);
                views[name].controller = controller;
                views[name].locals = locals;
                if(isDefined(sticky) && isString(sticky) && views[name].sticky === sticky) {
                    raiseRefresh(name, {
                        sticky: true
                    });
                } else {
                    views[name].version++;
                    views[name].sticky = sticky;
                    raiseUpdated(name);
                }
            };
            /**
            * @ngdoc method
            * @name dotjem.$view#setIfAbsent
            * @methodOf dotjem.routing.$view
            *
            * @param {string} name Name
            * @param {object} args Arguments
            *
            * @description
            *
            */
            /**
            * @ngdoc method
            * @name dotjem.$view#setIfAbsent
            * @methodOf dotjem.routing.$view
            *
            * @param {string} name Name
            * @param {object} template Template
            * @param {function=} controller Controller
            * @param {object=} locals Locals
            *
            * @description
            *
            */
            this.setIfAbsent = function (name, templateOrArgs, controller, locals) {
                var _this = this;
                var template = templateOrArgs;
                if(isArgs(templateOrArgs)) {
                    template = templateOrArgs.template;
                    controller = templateOrArgs.controller;
                    locals = templateOrArgs.locals;
                }
                ensureName(name);
                if(transaction) {
                    if(!containsView(transaction.records, name) || transaction.records[name].act === 'clear') {
                        transaction.records[name] = {
                            act: 'setIfAbsent',
                            fn: function () {
                                _this.setIfAbsent(name, template, controller, locals);
                            }
                        };
                    }
                    return;
                }
                if(!containsView(views, name)) {
                    views[name] = {
                        template: //TODO: Should we make this latebound so only views actually used gets loaded and rendered?
                        $template.get(template),
                        controller: controller,
                        locals: locals,
                        version: 0
                    };
                    raiseUpdated(name);
                }
            };
            /**
            * @ngdoc method
            * @name dotjem.$view#get
            * @methodOf dotjem.routing.$view
            *
            * @param {string} name Name
            *
            * @description
            *
            */
            this.get = function (name) {
                //TODO: return copies instead of actuals...
                if(isUndefined(name)) {
                    return views;
                }
                // Ensure checks if the view was defined at any point, not if it is still defined.
                // if it was defined but cleared, then null is returned which can be used to clear the view if desired.
                return views[name];
            };
            /**
            * @ngdoc method
            * @name dotjem.$view#refresh
            * @methodOf dotjem.routing.$view
            *
            * @param {string=} name Name
            * @param {object=} data Data
            *
            * @description
            *
            */
            this.refresh = function (name, data) {
                var _this = this;
                if(isUndefined(name)) {
                    forEach(views, function (val, key) {
                        _this.clear(key);
                    });
                } else if(transaction) {
                    transaction.records[name] = {
                        act: 'refresh',
                        fn: function () {
                            _this.refresh(name, data);
                        }
                    };
                    return;
                } else {
                    raiseRefresh(name, data);
                }
            };
            /**
            * @ngdoc method
            * @name dotjem.$view#beginUpdate
            * @methodOf dotjem.routing.$view
            *
            * @param {string} name Name
            *
            * @description
            *
            */
            this.beginUpdate = function () {
                if(transaction) {
                    throw new Error("Can't start multiple transactions");
                }
                var trx = transaction = {
                    records: {
                    }
                };
                return {
                    commit: function () {
                        transaction = null;
                        forEach(trx.records, function (rec) {
                            rec.fn();
                        });
                    },
                    cancel: function () {
                        transaction = null;
                    }
                };
            };
            return this;
        }    ];
}
angular.module('dotjem.routing').provider('$view', $ViewProvider);

/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
var $ScrollProvider = [
    function () {
        'use strict';
        /**
        * @ngdoc function
        * @name dotjem.routing.$scroll
        *
        * @requires $window
        * @requires $rootScope
        * @requires $anchorScroll
        * @requires $injector
        *
        * @param {string|function=} target The element name to scroll to or a function returning it.
        *
        * @description
        *
        */
        this.$get = [
            '$window', 
            '$rootScope', 
            '$anchorScroll', 
            '$injector', 
            function ($window, $rootScope, $anchorScroll, $injector) {
                var scroll = function (arg) {
                    var fn;
                    if(isUndefined(arg)) {
                        $anchorScroll();
                    } else if(isString(arg)) {
                        scrollTo(arg);
                    } else if((fn = injectFn(arg)) !== null) {
                        scrollTo(fn($injector));
                    }
                };
                scroll.$current = 'top';
                function scrollTo(elm) {
                    scroll.$current = elm;
                    if(elm === 'top') {
                        $window.scrollTo(0, 0);
                        return;
                    }
                    $rootScope.$broadcast('$scrollPositionChanged', elm);
                }
                return scroll;
            }        ];
    }
];
angular.module('dotjem.routing').provider('$scroll', $ScrollProvider);
//scroll.$register = register;
//var elements = {};
//function register(name: string, elm: HTMLElement) {
//    if (name in elements) {
//        var existing = elements[name];
//    }
//    elements[name] = elm;
//}
/****jQuery( "[attribute='value']"
* scrollTo: top - scroll to top, explicitly stated.
*           (This also enables one to override another scrollTo from a parent)
* scrollTo: null - don't scroll, not even to top.
* scrollTo: element-selector - scroll to an element id
* scrollTo: ['$stateParams', function($stateParams) { return stateParams.section; }
*           - scroll to element with id or view if starts with @
*/
//scrollTo: top - scroll to top, explicitly stated.(This also enables one to override another scrollTo from a parent)
//scrollTo: null - don't scroll, not even to top.
//scrollTo: @viewname - scroll to a view.
//    scrollTo: elementid - scroll to an element id
//scrollTo: ['$stateParams', function($stateParams) { return stateParams.section; } - scroll to element with id or view if starts with @

var jemViewDirective = [
    '$state', 
    '$scroll', 
    '$compile', 
    '$controller', 
    '$view', 
    '$animator', 
    function ($state, $scroll, $compile, $controller, $view, $animator) {
        'use strict';
        return {
            restrict: 'ECA',
            terminal: true,
            link: function (scope, element, attr) {
                var viewScope, controller, name = attr['jemView'] || attr.name, doAnimate = isDefined(attr.ngAnimate), onloadExp = attr.onload || '', animate = $animator(scope, attr), version = -1;
                scope.$on('$viewChanged', function (event, updatedName) {
                    if(updatedName === name) {
                        update(doAnimate);
                    }
                });
                scope.$on('$viewRefresh', function (event, refreshName, refreshData) {
                    if(refreshName === name) {
                        if(isFunction(viewScope.refresh)) {
                            viewScope.refresh(refreshData);
                        } else {
                            viewScope.$broadcast('$refresh', refreshName, refreshData);
                        }
                    }
                });
                scope.$on('$stateChangeSuccess', function () {
                    return update(doAnimate);
                });
                update(false);
                function destroyScope() {
                    if(viewScope) {
                        viewScope.$destroy();
                        viewScope = null;
                    }
                }
                function clearContent(doAnimate) {
                    if(doAnimate) {
                        animate.leave(element.contents(), element);
                    } else {
                        element.html('');
                    }
                    destroyScope();
                }
                function update(doAnimate) {
                    var view = $view.get(name), controller;
                    if(view && view.template) {
                        if(view.version === version) {
                            return;
                        }
                        version = view.version;
                        controller = view.controller;
                        view.template.then(function (html) {
                            clearContent(doAnimate);
                            if(doAnimate) {
                                animate.enter(angular.element('<div></div>').html(html).contents(), element);
                            } else {
                                element.html(html);
                            }
                            var link = $compile(element.contents()), locals;
                            viewScope = scope.$new();
                            if(controller) {
                                locals = copy(view.locals);
                                locals.$scope = viewScope;
                                controller = $controller(controller, locals);
                                element.contents().data('$ngControllerController', controller);
                            }
                            link(viewScope);
                            viewScope.$emit('$viewContentLoaded');
                            viewScope.$eval(onloadExp);
                        });
                    } else {
                        clearContent(doAnimate);
                    }
                }
            }
        };
    }];
angular.module('dotjem.routing').directive('jemView', jemViewDirective);

/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../interfaces.d.ts" />
/// <reference path="../common.ts" />
'use strict';
/**
* @ngdoc directive
* @name dotjem.routing.directive:jemAnchor
* @restrict ECA
*
* @description
*
* @element ANY
* @param {string} jemAnchor Identifier of the anchor
*
* @scope
* @example
<example module="ngViewExample" deps="angular-route.js" animations="true">
*/
var jemAnchorDirective = [
    '$scroll', 
    '$timeout', 
    function ($scroll, $timeout) {
        return {
            restrict: 'ECA',
            terminal: false,
            link: function (scope, element, attr) {
                var name = attr['jemAnchor'] || attr.id;
                //$scroll.$register(name, element);
                //TODO: This is not aware if there are multiple elements named the same, we should instead
                //      register the element with the $scroll service so that can throw an error if multiple
                //      elements has the same name.
                scope.$on('$scrollPositionChanged', function (event, target) {
                    scroll(target);
                });
                scroll($scroll.$current);
                function scroll(target) {
                    if(target === name) {
                        //Note: Delay scroll untill any digest is done.
                        $timeout(function () {
                            element[0].scrollIntoView();
                        }, 100);
                    }
                }
            }
        };
    }];
angular.module('dotjem.routing').directive('jemAnchor', jemAnchorDirective);


//NOTE: Expose for testing
dotjem.State = State;
dotjem.StateBrowser = StateBrowser;
dotjem.StateComparer = StateComparer;
dotjem.StateFactory = StateFactory;
dotjem.StateRules = StateRules;
dotjem.StateUrlBuilder = StateUrlBuilder;

})(window, document, dotjem || (dotjem = {}));