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
function buildParams(all, path, search) {
    var par = copy(all || {
    });
    par.$all = copy(all || {
    });
    par.$path = copy(path || {
    });
    par.$search = copy(search || {
    });
    return par;
}
function buildParamsFromObject(params) {
    var par = copy(params && params.all || {
    });
    par.$path = copy(params && params.path || {
    });
    par.$search = copy(params && params.search || {
    });
    return par;
    // params.path || {};
    // $state.params.$all = params.all;
    // $state.params.$search = params.search;
    }
//TODO: Taken fom Angular core, copied as it wasn't registered in their API, and couln't figure out if it was
//      a function of thie angular object.
function toKeyValue(obj, prepend) {
    var parts = [];
    forEach(obj, function (value, key) {
        parts.push(encodeUriQuery(key, true) + (value === true ? '' : '=' + encodeUriQuery(value, true)));
    });
    return parts.length ? prepend + parts.join('&') : '';
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

/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
/**
* @ngdoc object
* @name dotjem.routing.$stateTransitionProvider
*
* @description
* Use the `$stateTransitionProvider` to configure handlers for transitions between states.
* <br/>
* The transition handlers allows for canceling a transition, e.g. if it is invalid or rerouting it to another state.
* They can also be used to perform steps that should only be performed as part of a specific transition from e.g. state 'A' to state 'B', but not 'C' to 'B'.
* <br/>
* Besides the more general {@link dotjem.routing.$stateTransitionProvider#transition transition} method, specialized configuration methods exists for entering and leaving states.
* These specialized cases can also be configured on the states instead of using the `$stateTransitionProvider`. See {@link dotjem.routing.$stateProvider $stateProvider} for more information about that.
* <br/>
* ### Transition Handlers
* Handlers for transitions can be specified in a number of ways, where the most simple handler is an injectable `function`.
* <br/>
* Here is a basic example:
* <pre>
*  angular.module('demo', ['dotjem.routing'])
*    .config(['$stateTransitionProvider', function(stp) {
*      stp
*       .transition('locked', 'closed', ['$transition', function($transition) {
*         console.log('Door was unlocked');
*       }])
*       .transition('locked', 'open', ['$transition', function($transition) {
*         console.log("Can't open a locked door!");
*         $transition.cancel();
*       }])
*       .transition('open', 'closed', ['$transition', function($transition) {
*         console.log('Door was closed');
*       }])
*       .transition('open', 'locked', ['$transition', function($transition) {
*         console.log("Can't lock an open door!");
*         $transition.cancel();
*       }])
*       .transition('closed', 'open', ['$transition', function($transition) {
*         console.log('Door was opened');
*       }])
*       .transition('closed', 'locked', ['$transition', function($transition) {
*         console.log('Door was locked');
*       }])
*    }]);
* </pre>
* #### Handler Stages
* The example above describes how simple handlers can be registered, however handlers can also be specified to be called at specific transition stages.
* <br/>
* Basically this boils down to `before`, `between`, `after`. The flow of these will be:
*
* 1. Handler: `before`
* 2. Event: `$stateChangeStart`
* 3. Resolve: Views, Dependencies etc.
* 4. Handler: `between`
* 5. Event: `$stateChangeSuccess` or `$stateChangeError`
* 6. Handler: `after`
*
* When registering transitions like demonstrated in the example above, this will be maped to the "between" stage.
* <br/>
* To target specific stages of a transition use a transition object instead as in the example below:
* <pre>
*  angular.module('demo', ['dotjem.routing'])
*    .config(['$stateTransitionProvider', function(stp) {
*      stp
*       .transition('closed', 'open', {
*         before: ['$transition', function($transition) {
*           console.log('We are about to open the door.');
*         }],
*         between: ['$transition', function($transition) {
*           console.log('We are opening the door.');
*         }],
*         after: ['$transition', function($transition) {
*           console.log('We have opened the door.');
*         }]
*       }])
*    }]);
* </pre>
* Here we defined a handler for all stages, each stage is optional however, so if we just wished to be called before the transition started, we could leave the `between` and `after` out of it:
* <pre>
*  angular.module('demo', ['dotjem.routing'])
*    .config(['$stateTransitionProvider', function(stp) {
*      stp
*       .transition('closed', 'open', {
*         before: ['$transition', function($transition) {
*           console.log('We are about to open the door.');
*         }]
*       }])
*    }]);
* </pre>
* <br/>
* ### Targeting Multiple States
* When defining states when configuring transitions, multiple states can be targeted either using the `*` wildcard or as arrays.
* #### Using Wildcards
*
* By using `*` one can target all states the the Hierarchy below.
* <br/>
* So if we just use `*` we target all existing states under `root`, and we can define a global handler that gets called on all transitions by using `*` both as destination and source.
*
* <pre>
*  angular.module('demo', ['dotjem.routing'])
*    .config(['$stateTransitionProvider', function(stp) {
*      stp
*        .transition('*', '*', ['$transition', function($transition) {
*          console.log('This handler will get called for all transitions');
*        }])
*    }]);
* </pre>
*
* We can also target all transitions to or from a specific state that way:
*
* <pre>
*  angular.module('demo', ['dotjem.routing'])
*    .config(['$stateTransitionProvider', function(stp) {
*      stp
*        .transition('*', 'state', ['$transition', function($transition) {
*          console.log('This handler will get called for all'
*                    + ' transitions to "state"');
*        }])
*        .transition('state', '*', ['$transition', function($transition) {
*          console.log('This handler will get called for all'
*                    + ' transitions from "state"');
*        }])
*    }]);
* </pre>
*
* This was global handlers, but we might also wan't to target any state below a specific state:
*
* <pre>
*  angular.module('demo', ['dotjem.routing'])
*    .config(['$stateTransitionProvider', function(stp) {
*      stp
*        .transition('*', 'state.*', ['$transition', function($transition) {
*          console.log('This handler will get called for all transitions to'
*                    + ' "state" or any of its descendant states');
*        }])
*        .transition('state.*', '*', ['$transition', function($transition) {
*          console.log('This handler will get called for all transitions from'
*                    + ' "state" or any of it's descendant states');
*        }])
*    }]);
* </pre>
*
* #### Using Arrays
*
* In addition to using the `*` wildcart to target multiple states, it is also possible to use arrays for a more specific match.
*
* <pre>
*  angular.module('demo', ['dotjem.routing'])
*    .config(['$stateTransitionProvider', function(stp) {
*      stp
*        .transition(['book', 'book.item', 'book.list'],
*                    'paper',
*                    ['$transition', function($transition) {
*                      console.log('This handler will get called for transitions from'
*                                + ' "book", "book.item" and "book.list" to "paper"');
*        })]
*        .transition('paper',
*                    ['book', 'book.item', 'book.list'],
*                    ['$transition', function($transition) {
*                      console.log('This handler will get called for transitions to'
*                                + ' "book", "book.item" and "book.list" from "paper"');
*        }])
*    }]);
* </pre>
*
* Each of the states, wildcards can also be used:
*
* <pre>
*  angular.module('demo', ['dotjem.routing'])
*    .config(['$stateTransitionProvider', function(stp) {
*      stp
*       .transition(['book', 'book.item.*', 'book.list.*'],
*                   ['paper', 'pen.*'],
*                   ['$transition', function($transition) {
*                     console.log('Handle all the above, this creates'
*                               + ' to many combinations to write out');
*       }])
*    }]);
* </pre>
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
    * @param {string|State|Array} state The state name matchers(s) to match when entering.
    * @param {funtion|Object} handler The handler to invoke when entering the state.
    * <br/>
    * Either a injectable function or a handler object. If handler is an object, it must define one or more of the
    * following properties:
    *
    * - `before` `{function}` : handler to be called before transition starts
    * - `between` `{function}` : handler to be called right after views are resolved
    * - `after` `{function}` : handler to be called when transition is complete
    *
    * @description
    * This is a shorthand method for `$stateTransitionProvider.transition('*', state, handler);`
    * <br/>
    * Instead of using this method, the transitions can also be configured when defining states through the {@link dotjem.routing.$stateProvider $stateProvider}.
    */
    this.onEnter = function (state, handler) {
        //TODO: Validation
        if(isObject(handler)) {
            var aligned = alignHandler(handler);
            this.transition(aligned.from || '*', state, aligned.handler);
        } else if(isFunction(handler) || isArray(handler)) {
            this.transition('*', state, handler);
        }
    };
    /**
    * @ngdoc method
    * @name dotjem.routing.$stateTransitionProvider#onExit
    * @methodOf dotjem.routing.$stateTransitionProvider
    *
    * @param {string|State|Array} state The state name matchers(s) to match when leaving.
    * @param {funtion|Object} handler The handler to invoke when entering the state.
    * <br/>
    * Either a injectable function or a handler object. If handler is an object, it must define one or more of the
    * following properties:
    *
    * - `before` `{function}` : handler to be called before transition starts
    * - `between` `{function}` : handler to be called right after views are resolved
    * - `after` `{function}` : handler to be called when transition is complete
    *
    * @description
    * This is a shorthand method for `$stateTransitionProvider.transition(state, '*', handler);`
    * <br/>
    * Instead of using this method, the transitions can also be configured when defining states through the {@link dotjem.routing.$stateProvider $stateProvider}.
    */
    this.onExit = function (state, handler) {
        if(isObject(handler)) {
            var aligned = alignHandler(handler);
            this.transition(state, aligned.to || '*', aligned.handler);
        } else if(isFunction(handler) || isArray(handler)) {
            this.transition(state, '*', handler);
        }
    };
    /**
    * @ngdoc method
    * @name dotjem.routing.$stateTransitionProvider#transition
    * @methodOf dotjem.routing.$stateTransitionProvider
    *
    * @param {string|State|Array} from The state name matchers(s) to match on leaving.
    * @param {string|State|Array} to The The state name matchers(s) to match on entering.
    * @param {funtion|Object} handler The handler to invoke when the transitioning occurs.
    * <br/>
    * Either a injectable function or a handler object. If handler is an object, it must define one or more of the
    * following properties:
    *
    * - `before` `{function}` : handler to be called before transition starts
    * - `between` `{function}` : handler to be called right after views are resolved
    * - `after` `{function}` : handler to be called when transition is complete
    *
    * @description
    * Register a single handler to get called when leaving the state(s) passed as the from parameter
    * to the state(s) passed as the to parameter.
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
            if(injectFn(handler)) {
                // angular.isFunction(handler) || angular.isArray(handler)) {
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
    * @description
    * See {@link dotjem.routing.$stateTransitionProvider $stateTransitionProvider} for details on how to configure transitions.
    */
    this.$get = [
        '$q', 
        '$injector', 
        function ($q, $injector) {
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
/// <reference path="state/transition.ts" />
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
* Used for configuring states.
* <br/>
* Here is a very basic example of configuring states.
*
* <pre>
* angular.module('demo', ['dotjem.routing']).
*   config(['$stateProvider', function($stateProvider) {
*   $stateProvider
*       .state('phones', { /*.. Parameters for the state ..*\/ })
*       .state('tablets', { /*.. Parameters for the state ..*\/ });
* }]);
* </pre>
*
* In it self that is not really useful, but the state it self can have views added as well as onEnter / onExit handlers.
* <br/>
* ### Views
* <hr/>
* At this basic level you can also configure multiple views, just add a number of `ui - view` directives with unique names, and simply target those from the configuration.
* <br/>
* e.g.if we had a `main` view and a `hint` view we could do.
*
* <pre>
*  angular.module('demo', ['dotjem.routing']).
*    config(['$stateProvider', function ($stateProvider) {
*      $stateProvider
*        .state('phones', {
*          views: {
*           'main': { template: 'phones.html' },
*           'hint': { template: { html: '@phones' } }
*         }
*      })
*      .state('tablets', {
*          views: {
*           'main': { template: 'tablets.html' },
*           'hint': { template: { html: '@tablets' } }
*         }
*       })
*  }]);
* </pre>
* <br/>
* **Note:** The template is suddenly an object with an `html` property, there is a number of ways to configure templates, see {@link dotjem.routing.$template $template} for more details on that.
* <br/>
* ### Controllers
* <hr/>
* Standing alone like this, views are very static , but just like the original angular routing, we can add controllers to a view.
*
* <pre>
*  angular.module('demo', ['dotjem.routing']).
*    config(['$stateProvider', function ($stateProvider) {
*      $stateProvider
*        .state('phones', {
*          views: {
*            'main': { template: 'phones.html', controller: 'PhonesCtrl' },
*            'hint': { template: { html: '@phones' } }
*          }
*        })
*        .state('tablets', {
*          views: {
*            'main': { template: 'tablets.html', controller: 'TabletsCtrl' },
*            'hint': { template: { html: '@tablets' } }
*          }
*        })
*    }])
*    .controller('PhonesCtrl', ['$scope', function ($scope) { /*...*\/ }])
*    .controller('TabletsCtrl', ['$scope', function ($scope) { /*...*\/ }]);
* </pre>
* <br/>
* ### Nested States
* <hr/>
* Until now we have had a flat list of states, but this doesn't really provide many enhancements over the existing routing concept, even with multiple views, all views are always reloaded. Also it could get quite complex if views dependent on each other couldn't be arranged in a hierarchy.
* <br/>
* The `$stateProvider` provides configuring states in a hierarchy in two ways.
* <br/>
* One way is using a name convention for states where `.` is used to separate state levels. So that the state `phones.list` becomes a child of `phones`, it is important however that `phones` is defined before it's children.
*
* <pre>
*  angular.module('demo', ['dotjem.routing']).
*    config(['$stateProvider', function($stateProvider) {
*      $stateProvider
*          .state('phones', {
*            views: {
*              'main': { template: 'phones.html', controller: 'PhonesCtrl' },
*             'hint': { template: { html: '@phones' } }
*         }
*     })
*     .state('phones.list', {
*         views: {
*             'main.content': {
*                 template: 'phones.list.html',
*                 controller: 'PhonesListCtrl'
*             },
*             'hint': { template: { html: '@phones.list' } }
*         }
*     })
*     .state('phones.detail', {
*         views: {
*             'main.content': {
*                 template: 'phones.detail.html',
*                 controller: 'PhonesDetailsCtrl'
*             },
*             'hint': { template: { html: '@phones.list' } }
*         }
*     })
* }])
*  .controller('PhonesCtrl', ['$scope', function ($scope) { /*...*\/ }])
*  .controller('PhonesListCtrl', ['$scope', function ($scope) { /*...*\/ }])
*  .controller('PhonesDetailsCtrl', ['$scope', function ($scope) { /*...*\/ }]);
* </pre>
*
* The above may indicate that views also has a child to parent relation in the naming, but this is merely a good naming convention, there is no constraint on how views are named.
* <br/>
* It is recommended that they are unique however, unless you diliberately wish to load the same content into multiple areas of a page, if multiple views use the same name within a page, they will load the same content, but they will render independendly.
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
        * <pre>
        *  .state('home', {})
        *  .state('home.recents', {})
        *  .state('home.all', {})
        *  .state('staff', {})
        *  .state('staff.all', {})
        *  .state('staff.single', {})
        * </pre>
        *
        * <img type="image/svg+xml" src="assets/state.provider.structure.png"/>
        *
        * @param {Object} state All information about the state.
        *
        *    Object properties:
        *
        * - `views`: `{Object=}` A list og views to be updated when the state is activated.
        * - `route`: `{string=}` A route to associate the state with,
        *   this will be registered with the {@link dotjem.routing.$routeProvider $routeProvider}
        * - `onEnter`: `{string|function|Object=}` value
        * - `onExit`: `{string|function|Object=}` value
        * - `reloadOnSearch`: `{boolean=}` If associated with a route, should that route reload on search.
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
            '$resolve', 
            function ($rootScope, $q, $injector, $route, $view, $transition, $location, $scroll, $resolve) {
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
                * To transition to another state, use `goto`...
                *
                * - state: either the full name of a state or a state object (e.g. use `lookup` to get that object).
                * - params: (optional) a set of parameters to use for the state.
                *
                * If the state has an associated route, that route will be activated and the location with change it the address bar of the browser. It is also important that all parameters are defined for such route, however if the previous state defines any of those, they won't need to be redefined.
                *
                * e.g. say the following states are defined:
                *
                * <pre>
                * $stateProvider
                *   .state('home', { route: '/home/:homeParam' })
                *   .state('home.child', { route: '/child/:childParam' })
                * </pre>
                *
                * To activate the `home` state, a call to goto must include the `:homeParam` e.g:
                *
                * <pre>
                * $state.goto('home', { homeParam: 'goHome' } );
                * </pre>
                *
                * To activate the `home.child` state, a call to goto must include the `:homeParam` and the `:childParam` e.g:
                *
                * <pre>
                * $state.goto('home.child', { homeParam: 'goHome', childParam: 'goChild' } );
                * </pre>
                *
                * To activate the `home.child` state when currently in the `home` state, a call to goto must include the the `:childParam` and can optionally include the `:homeParam` e.g:
                *
                * </pre>
                * $state.goto('home.child', { childParam: 'goChild' } );
                * $state.goto('home.child', { homeParam: 'goHome', childParam: 'goChild' } );
                * </pre>
                *
                * We can leave out the home param as that is already defined in the current set of params, that also means we can goto home from child without specifying any params, but if we wish to change it we must specify it, the following example will demonstrate a full flow:
                *
                * <pre>
                * $state.goto('home', { homeParam: 1 } );
                * // - location set to: '/home/1'
                *
                * $state.goto('home.child', { childParam: 1 } );
                * // - location set to: '/home/1/child/1'
                *
                * $state.goto('home');
                * // - location set to: '/home/1'
                *
                * $state.goto('home.child', { homeParam: 2, childParam: 2 } );
                * // - location set to: '/home/2/child/2'
                *
                * $state.goto('home.child', { childParam: 4 } );
                * // - location set to: '/home/2/child/4'
                *
                * $state.goto('home.child', { homeParam: 4 } );
                * // - location set to: '/home/4/child/4'
                * </pre>
                */
                /**
                * @ngdoc method
                * @name dotjem.routing.$state#lookup
                * @methodOf dotjem.routing.$state
                *
                * @param {string} path Path expression to the state that can either be relative to the current state or from the root (/).
                *
                * @description
                * To lookup a state, use `lookup`...
                * <br/>
                * <br/>
                * Path is inspired by XPath and supports a subset of that syntax.
                *
                * - `.` : current state
                * - `..` : parent state
                * - `/` : path separator
                * - `[]` : index selector, errors on overflow
                * - `$node()` : sibling selector, can overflow
                *
                * <br/><br/>
                * Using these selectors, the following are examples of paths:
                *
                * - `state` : Selects `state` from the current node.
                * - `/state` : Selects `state` from the root.
                * - `./state` : Selects `state` from the current node.
                * - `./state/child` : Selects `child` under `state` from the current node.
                * - `../state` : Selects `state` under the parent of the current state.
                * - `[0]` : Selects the first child of the current state.
                * - `[-1]` : Selects the last child of the current state.
                * - `./state/[-1]` : Selects the last child under `state` under current state.
                * - `$node(1)` : Selects the next sibling of the current state.
                * - `$node(-1)` : Selects the previous sibling of the current state.
                *
                * <br/><br/>
                * **Note:** When using `$node()`, it allows for overflow. this means if you are at the last child of a state and selects `$node(1)`, it will select the first child instead.
                * <br/><br/>
                * Finally it is also possible to select states by their full name, however as `state` would also be a valid relative selector, full name selection is only used when the name contains a `.`, this means that if you wish to select the states directly under root by name you will have to use either the syntax above or it's full name with root included:
                *
                * - `root.state`: Selects `state` under root.
                * - `/state` : Selects `state` under root.
                *
                * <br/><br/>
                * Errors will be thrown in cases where the path isn't valid.
                * The root state it self can't be selected. (The root state is implicitly defined by the system, when defining `.state('home', {...});`, the state `home` isn't a root state, it is instead a child of root.
                */
                /**
                * @ngdoc method
                * @name dotjem.routing.$state#reload
                * @methodOf dotjem.routing.$state
                *
                * @param {State|string|boolean=} state Name or State in the current hierachy or true/false
                *
                * @description
                * To force reload a state, use `reload`...
                *
                * - call `.reload()` to reload only the current leaf state.
                * - call `.reload(true)` to reload all active states from the root state to the current leaf.
                * - call `.reload('state.full.name')` to reload all states from `state.full.name` and down to the current leaf.
                * <br/><br/>
                * E.g. if the current state is `state.full.name.to.here` and `.reload()` is called then all views etc. will be reloaded for the leaf state `here`.
                * <br/><br/>
                * If `.reload(true)` called, views etc. will be reloaded for all the states `state`, `full`, `name`, `to`, `here`.
                * <br/><br/>
                * Finally if  `.reload('state.full.name')` is called, views etc. will be reloaded for the states `name`, `to`, `here`.
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
                * To build a url for a particular state, use `url`...
                * <br/><br/>
                * If the state defined either by state, or current state does not have an route associated with it, it will throw an error.
                */
                /**
                * @ngdoc method
                * @name dotjem.routing.$state#is
                * @methodOf dotjem.routing.$state
                *
                * @param {State|string=} state A State or name to check against the current state.
                *
                * @description
                * Checks if the current state matches the provided state.
                *
                * @returns {boolean} true if the stats mathces, otherwise false.
                */
                var urlbuilder = new StateUrlBuilder($route);
                var forceReload = null, current = root, $state = {
                    root: // NOTE: root should not be used in general, it is exposed for testing purposes.
                    root,
                    current: extend(root.self, {
                        $params: buildParams()
                    }),
                    params: buildParams(),
                    goto: function (state, params) {
                        goto({
                            state: state,
                            params: buildParams(params),
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
                    },
                    is: function (state) {
                        return current.is(toName(state));
                    },
                    isActive: function (state) {
                        return current.isActive(toName(state));
                    }
                };
                $rootScope.$on('$routeChangeSuccess', function () {
                    var route = $route.current;
                    if(route) {
                        if(route.state) {
                            goto({
                                state: route.state,
                                params: buildParams(route.params, route.pathParams, route.searchParams),
                                route: route
                            });
                        }
                    } else {
                        goto({
                            state: root,
                            params: buildParams()
                        });
                    }
                });
                $rootScope.$on('$routeUpdate', function () {
                    var route = $route.current;
                    raiseUpdate(buildParams(route.params, route.pathParams, route.searchParams));
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
                            params: $state.params,
                            route: $route.current
                        });
                    });
                }
                function raiseUpdate(params) {
                    $state.params = params;
                    $state.current.$params = params;
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
                    }), fromState = $state.current, emit = $transition.find($state.current, toState), transaction, scrollTo, changed = comparer.compare(browser.lookup(toName($state.current)), to, fromState.$params, toState.$params, forceReload), transition = new Transition(goto);
                    if(!forceReload && !changed.stateChanges) {
                        if(changed.paramChanges) {
                            raiseUpdate(params);
                        }
                        return;
                    }
                    forceReload = null;
                    if(args.updateroute && to.route) {
                        //TODO: This is very similar to what we do in buildStateArray -> extractParams,
                        //      maybe we can refactor those together
                                                var paramsObj = {
                        }, allFrom = $state.params.$all;
                        forEach(to.route.params, function (param, name) {
                            if(name in allFrom) {
                                paramsObj[name] = allFrom[name];
                            }
                        });
                        var mergedParams = extend(paramsObj, params.$all);
                        //TODO: One problem here is that if you passed in "optional" parameters to goto, and the to-state has
                        //      a route, we actually end up loosing those
                        $route.change(extend({
                        }, to.route, {
                            params: mergedParams
                        }));
                        return;
                    }
                    emit.before(transition);
                    if(transition.canceled) {
                        //TODO: Should we do more here?... What about the URL?... Should we reset that to the privous URL?...
                        //      That is if this was even triggered by an URL change in the first place.
                        return;
                    }
                    if($rootScope.$broadcast('$stateChangeStart', toState, fromState).defaultPrevented) {
                        return;
                    }
                    $q.when(toState).then(function () {
                        var useUpdate = false, alllocals = {
                        };
                        transaction = $view.beginUpdate();
                        $view.clear();
                        var promise = $q.when(0);
                        forEach(changed.array, function (change) {
                            promise = promise.then(function () {
                                if(useUpdate = change.isChanged || useUpdate) {
                                    $resolve.clear(change.state.resolve);
                                }
                                return $resolve.all(change.state.resolve, alllocals);
                            }).then(function (locals) {
                                alllocals = extend({
                                }, alllocals, locals);
                                scrollTo = change.state.scrollTo;
                                forEach(change.state.views, function (view, name) {
                                    var sticky, fn;
                                    if(sticky = view.sticky) {
                                        if(fn = injectFn(sticky)) {
                                            sticky = fn($injector, {
                                                $to: toState,
                                                $from: fromState
                                            });
                                        } else if(!isString(sticky)) {
                                            sticky = change.state.fullname;
                                        }
                                    }
                                    if(useUpdate || isDefined(sticky)) {
                                        $view.setOrUpdate(name, view.template, view.controller, alllocals, sticky);
                                    } else {
                                        $view.setIfAbsent(name, view.template, view.controller, alllocals);
                                    }
                                });
                            });
                        });
                        return promise.then(function () {
                            emit.between(transition);
                            if(transition.canceled) {
                                transaction.cancel();
                                //TODO: Should we do more here?... What about the URL?... Should we reset that to the privous URL?...
                                //      That is if this was even triggered by an URL change in teh first place.
                                return;
                            }
                            current = to;
                            $state.params = params;
                            $state.current = toState;
                            transaction.commit();
                            $rootScope.$broadcast('$stateChangeSuccess', toState, fromState);
                        });
                    }).then(function () {
                        if(!transition.canceled) {
                            transition.cancel = function () {
                                throw Error("Can't cancel transition in after handler");
                            };
                            emit.after(transition);
                            $scroll(scrollTo);
                        }
                        //Note: nothing to do here.
                                            }, function (error) {
                        transaction.cancel();
                        $rootScope.$broadcast('$stateChangeError', toState, fromState, error);
                    });
                }
            }        ];
    }];
angular.module('dotjem.routing').provider('$state', $StateProvider);

/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
/// <reference path="state/state.ts" />
/// <reference path="state/transition.ts" />
/// <reference path="state/stateFactory.ts" />
/// <reference path="state/stateRules.ts" />
/// <reference path="state/stateComparer.ts" />
/// <reference path="state/stateBrowser.ts" />
/// <reference path="state/stateUrlBuilder.ts" />
var $ResolveProvider = [
    function () {
        'use strict';
        /**
        * @ngdoc object
        * @name dotjem.routing.$resolve
        *
        * @requires $q
        * @requires $injector
        *
        * @description
        * The `$resolve` service is used to resolve values for states
        *
        *
        *
        */
        this.$get = [
            '$q', 
            '$injector', 
            function ($q, $injector) {
                var $service = {
                };
                var cache = {
                };
                /**
                * @ngdoc method
                * @name dotjem.routing.$resolve#push
                * @methodOf dotjem.routing.$resolve
                *
                * @param {string} key A key for the value.
                * @param {Object} value The value.
                *
                * @description
                * Pushes a value into the resolver.
                */
                $service.push = function (key, value) {
                    cache[key] = value;
                };
                /**
                * @ngdoc method
                * @name dotjem.routing.$resolve#clear
                * @methodOf dotjem.routing.$resolve
                *
                * @param {string} key A key for the value to remove from the resolvers cache.
                *
                * @description
                * Clears a value in the resolver.
                */
                /**
                * @ngdoc method
                * @name dotjem.routing.$resolve#clear
                * @methodOf dotjem.routing.$resolve
                *
                * @param {Array} keys An array of keys for the values to remove from the resolvers cache.
                *
                * @description
                * Clears a list of values in the resolver.
                */
                $service.clear = function (arg) {
                    if(isUndefined(arg)) {
                        cache = {
                        };
                    }
                    if(isString(arg)) {
                        delete cache[arg];
                    } else if(isObject(arg)) {
                        //TODO: This part should not be the responsibility of the resolver?
                        angular.forEach(arg, function (value, key) {
                            $service.clear(key);
                        });
                    } else if(isArray(arg)) {
                        angular.forEach(arg, function (key) {
                            $service.clear(key);
                        });
                    }
                };
                $service.all = function (args, locals) {
                    var values = [], keys = [], def = $q.defer();
                    angular.forEach(args, function (value, key) {
                        var ifn;
                        keys.push(key);
                        try  {
                            if(!(key in cache)) {
                                if(isString(value)) {
                                    cache[key] = angular.isString(value);
                                } else if((ifn = injectFn(value)) != null) {
                                    cache[key] = ifn($injector, locals);
                                }
                            }
                            values.push(cache[key]);
                        } catch (e) {
                            def.reject("Could not resolve " + key);
                        }
                    });
                    $q.all(values).then(function (values) {
                        var locals = {
                        };
                        angular.forEach(values, function (value, index) {
                            locals[keys[index]] = value;
                        });
                        def.resolve(locals);
                    }, function (error) {
                        def.reject(error);
                    });
                    return def.promise;
                };
                return $service;
            }        ];
    }];
angular.module('dotjem.routing').provider('$resolve', $ResolveProvider);

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
    * @requires $http
    * @requires $q
    * @requires $injector
    * @requires $templateCache
    *
    * @description
    * The $template services is used to load templates, templates are cached using the '$templateCache'.
    * <br/>
    * **Note:** all templates are returned as promises.
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
            * If a template object i used, one of the following properties must be used:
            *
            * - `url` `{string}`: An url location of the template.
            * - `fn` `{function}`: A function that returns the template.
            * - `html` `{string}`: The actual template as raw html.
            *
            * <br/>
            * **Note:** if a template object defines more than one of those, the first one the `$template` service encounters will be used
            * based on the order above, and the rest ignored. E.g. if a template object defines `url` and `html`, `html` is ignored.
            *
            * @returns {Promise} a promise that resolves to the template.
            *
            * @description
            * Retrieves a template and returns that as a promise. A Template is a piece of html.
            */
            var $template = {
                'get': function (template) {
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
                }
            };
            return $template;
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
    * @requires $rootScope
    * @requires $q
    * @requires $template
    *
    * @description
    * The `$view` service is used to update any defined {@link dotjem.routing.directive:jemView jemView} directive defined in the DOM.
    * This will primarily used by the {@link dotjem.routing.$state $state} service to update views on transitions. But that way, the `$view` service
    * enables also enables changes to views through transitions defined on the {@link dotjem.routing.$stateTransitionProvider $stateTransitionProvider}.
    * <br/>
    * It also allows updates outside the scope of the `$state` service.
    * <br/>
    * **Note:** Whenever a state change causes a series of view updates, these are done in a "transaction", this means that they won't be applied untill
    * the state transition has run to completion. This means that when accessing the `$view` service within transitions etc. will fall in under the same transaction, which
    * is different than if we call it in a different context.
    * <br/>
    * Any outside services are also able to create transactional updates by calling the `beginUpdate` method, and then `commit` on the returned object.
    *
    *
    *
    */
    this.$get = [
        '$rootScope', 
        '$q', 
        '$template', 
        function ($rootScope, $q, $template) {
            var views = {
            }, transaction = null, $view = {
            };
            function isArgs(args) {
                return isObject(args) && (isDefined(args.template) || isDefined(args.controller) || isDefined(args.locals) || isDefined(args.sticky));
            }
            function ensureName(name) {
                if(name === 'undefined') {
                    throw new Error('Must define a view name.');
                }
            }
            ;
            /**
            * @ngdoc event
            * @name dotjem.routing.$view#$viewUpdate
            * @eventOf dotjem.routing.$view
            *
            * @eventType broadcast on root scope
            *
            * @description
            * Broadcasted when a view updated, if a transaction is active this will not occur before that is commited.
            *
            * @param {Object} angularEvent Synthetic event object.
            * @param {State} name Name of the view that was updated.
            */
            function raiseUpdated(name) {
                $rootScope.$broadcast('$viewUpdate', name);
            }
            /**
            * @ngdoc event
            * @name dotjem.routing.$view#$viewRefresh
            * @eventOf dotjem.routing.$view
            *
            * @eventType broadcast on root scope
            *
            * @description
            * Broadcasted when a view refreshed, if a transaction is active this will not occur before that is commited.
            *
            * @param {Object} angularEvent Synthetic event object.
            * @param {State} name Name of the view that was refreshed.
            */
            function raiseRefresh(name, data) {
                $rootScope.$broadcast('$viewRefresh', name, data);
            }
            function containsView(map, name) {
                return (name in map) && map[name] !== null;
            }
            /**
            * @ngdoc method
            * @name dotjem.routing.$view#clear
            * @methodOf dotjem.routing.$view
            *
            * @param {string=} name The name of the view to clear.
            *
            * @description
            * Clears all views.
            */
            /**
            * @ngdoc method
            * @name dotjem.routing.$view#clear
            * @methodOf dotjem.routing.$view
            *
            * @param {string} name The name of the view to clear.
            *
            * @description
            * Clears the named view.
            */
            $view.clear = function (name) {
                if(isUndefined(name)) {
                    forEach(views, function (val, key) {
                        $view.clear(key);
                    });
                } else {
                    if(transaction) {
                        transaction.records[name] = {
                            act: 'clear',
                            fn: function () {
                                $view.clear(name);
                            }
                        };
                        return;
                    }
                    delete views[name];
                    raiseUpdated(name);
                }
            };
            /**
            * @ngdoc method
            * @name dotjem.routing.$view#setOrUpdate
            * @methodOf dotjem.routing.$view
            *
            * @param {string} name The name of the view to update as defined with the {@link dotjem.routing.directive:jemView jemView} directive.
            * @param {object} args View update arguments
            *
            *  args properties:
            *
            * - `template`: `{string|Object|function}` The template to be applied to the view. See {@link dotjem.routing.$template $template} on ways to define templates.
            * - `controller`: `{string|function=}` The view confroller either as a function or a named controller defined on the module or a referenced module.
            * - `locals`: `{Object=}` value An optional map of dependencies which should be injected into the controller.
            * - `sticky`: `{string=}` value A flag indicating that the view is sticky.
            *
            * @description
            * Sets or Updates a named view, this forces an update if the view has already been updated by another call to the view service.
            * <br/>
            * If the view is marked sticky it will only force an update if the sticky flag is different than the previous one. In cases where it
            * is the same the `$viewRefresh` event will be raised instead.
            * <br/>
            * Views can also be refreshed by calling the `refresh` method.
            */
            /**
            * @ngdoc method
            * @name dotjem.routing.$view#setOrUpdate
            * @methodOf dotjem.routing.$view
            *
            * @param {string} name The name of the view to update as defined with the {@link dotjem.routing.directive:jemView jemView} directive.
            * @param {string|object} template The template to be applied to the view. See {@link dotjem.routing.$template $template} on ways to define templates.
            * @param {function=} controller The view confroller either as a function or a named controller defined on the module or a referenced module.
            * @param {object=} locals An optional map of dependencies which should be injected into the controller.
            * @param {string=} sticky A flag indicating that the view is sticky.
            *
            * @description
            * Sets or Updates a named view, this forces an update if the view has already been updated by another call to the view service.
            * <br/>
            * If the view is marked sticky it will only force an update if the sticky flag is different than the previous one. In cases where it
            * is the same the `$viewRefresh` event will be raised instead.
            * <br/>
            * Views can also be refreshed by calling the `refresh` method.
            */
            $view.setOrUpdate = function (name, templateOrArgs, controller, locals, sticky) {
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
                            $view.setOrUpdate(name, template, controller, locals, sticky);
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
                //      also we obtain the actual template even if it's an update for a sticky view, while the "cache" takes
                //      largely care of this, it could be an optimization to not do this?
                views[name].template = $template.get(template);
                views[name].controller = controller;
                views[name].locals = locals;
                if(isDefined(sticky) && isString(sticky) && views[name].sticky === sticky) {
                    raiseRefresh(name, {
                        $locals: locals,
                        sticky: sticky
                    });
                } else {
                    views[name].version++;
                    views[name].sticky = sticky;
                    raiseUpdated(name);
                }
            };
            /**
            * @ngdoc method
            * @name dotjem.routing.$view#setIfAbsent
            * @methodOf dotjem.routing.$view
            *
            * @param {string} name The name of the view to set as defined with the {@link dotjem.routing.directive:jemView jemView} directive.
            * @param {object} args View update arguments
            *
            *  args properties:
            *
            * - `template`: `{string|Object|function}` The template to be applied to the view. See {@link dotjem.routing.$template $template} on ways to define templates.
            * - `controller`: `{string|function=}` The view confroller either as a function or a named controller defined on the module or a referenced module.
            * - `locals`: `{Object=}` value An optional map of dependencies which should be injected into the controller.
            *
            * @description
            * Sets a named view if it is not yet known by the `$view` service of if it was cleared. If the view is already updated by another call this call will be ignored.
            */
            /**
            * @ngdoc method
            * @name dotjem.routing.$view#setIfAbsent
            * @methodOf dotjem.routing.$view
            *
            * @param {string} name The name of the view to update as defined with the {@link dotjem.routing.directive:jemView jemView} directive.
            * @param {string|object} template The template to be applied to the view. See {@link dotjem.routing.$template $template} on ways to define templates.
            * @param {function=} controller The view confroller either as a function or a named controller defined on the module or a referenced module.
            * @param {object=} locals An optional map of dependencies which should be injected into the controller.
            *
            * @description
            * Sets a named view if it is not yet known by the `$view` service of if it was cleared. If the view is already updated by another call this call will be ignored.
            */
            $view.setIfAbsent = function (name, templateOrArgs, controller, locals) {
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
                                $view.setIfAbsent(name, template, controller, locals);
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
            * @name dotjem.routing.$view#get
            * @methodOf dotjem.routing.$view
            *
            * @description
            * Gets all current view configurations. If a transaction is in progress, updates provided by that will not be reflected untill
            * it is comitted.
            *
            * @returns {Array} A list of view configuration objects, each object may defined the following properties:
            *
            * - `name`: `{string}` The name of the view.
            * - `version`: `{number}` The version the view is currently in.
            * - `template`: `{string|Object|function}` The template to be applied to the view. See {@link dotjem.routing.$template $template} on ways to define templates.
            * - `controller`: `{string|function=}` The view confroller either as a function or a named controller defined on the module or a referenced module.
            * - `locals`: `{Object=}` value An optional map of dependencies which should be injected into the controller.
            * - `sticky`: `{string=}` value A flag indicating that the view is sticky.
            */
            /**
            * @ngdoc method
            * @name dotjem.routing.$view#get
            * @methodOf dotjem.routing.$view
            *
            * @param {string} name The name of the view for which to get the configuration.
            *
            * @description
            * Gets the configuration for a namved view. If a transaction is in progress, updates provided by that will not be reflected untill
            * it is comitted.
            *
            * @returns {Object} A view configuration object, this object may defined the following properties:
            *
            * - `name`: `{string}` The name of the view.
            * - `version`: `{number}` The version the view is currently in.
            * - `template`: `{string|Object|function}` The template to be applied to the view. See {@link dotjem.routing.$template $template} on ways to define templates.
            * - `controller`: `{string|function=}` The view confroller either as a function or a named controller defined on the module or a referenced module.
            * - `locals`: `{Object=}` value An optional map of dependencies which should be injected into the controller.
            * - `sticky`: `{string=}` value A flag indicating that the view is sticky.
            */
            $view.get = function (name) {
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
            * @name dotjem.routing.$view#refresh
            * @methodOf dotjem.routing.$view
            *
            * @description
            * Refreshes all views.
            */
            /**
            * @ngdoc method
            * @name dotjem.routing.$view#refresh
            * @methodOf dotjem.routing.$view
            *
            * @param {string} name The view to send a refresh.
            * @param {object=} data An optional data object containing information for the refresh.
            *
            * @description
            * Refreshes a named view.
            */
            $view.refresh = function (name, data) {
                if(isUndefined(name)) {
                    forEach(views, function (val, key) {
                        $view.refresh(key, data);
                    });
                } else if(transaction) {
                    transaction.records[name] = {
                        act: 'refresh',
                        fn: function () {
                            $view.refresh(name, data);
                        }
                    };
                    return;
                } else {
                    //TODO: Here we still raise the event even if the view does not exist, we should propably do some error handling here?
                    data.$locals = views[name] && views[name].locals;
                    raiseRefresh(name, data);
                }
            };
            /**
            * @ngdoc method
            * @name dotjem.routing.$view#beginUpdate
            * @methodOf dotjem.routing.$view
            *
            * @description
            * Starts a new view update transaction in which to record all changes to views before actually applying them.
            *
            * @returns {Object} A transaction object that can be used to commit or cancel the transaction, see {@link dotjem.routing.type:transaction Transaction} for more details.
            */
            /**
            * @ngdoc interface
            * @name dotjem.routing.type:transaction
            * @description
            *
            * Records updates to views and applies them when committed.
            */
            /**
            * @ngdoc method
            * @name dotjem.routing.type:transaction#commit
            * @methodOf dotjem.routing.type:transaction
            *
            * @description
            * Commits the view transaction, applying any changes that may have been recorded.
            * <br/>
            * Only the final state will be applied, meaning that if the same view had recieved a series of updates, only an update
            * for the final state the view will take will be issues, if it causes the view to change state.
            */
            /**
            * @ngdoc method
            * @name dotjem.routing.type:transaction#cancel
            * @methodOf dotjem.routing.type:transaction
            *
            * @description
            * Cancels the view transaction, discarding any changes that may have been recorded.
            */
            $view.beginUpdate = function () {
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
            return $view;
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
        * The `$scroll` service offers a number of enhancements over the current `@anchorScroll` and serves for a direct replacement.
        *
        * When called with no parameter like `$scroll()` the call is re-routed to `$anchorScroll` otherwise `$scroll` performs the scrolling.
        *
        * Scrolling to named elements is dependant on the `jemAnchor` directive which will register elements to be targets for the `$scroll` service. This is
        * to allow elements that is being loaded as part of a transition to also work as targets after `$scroll` has been called.
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
    State.prototype.is = function (state) {
        return this.fullname === state || this.fullname === 'root.' + state;
    };
    State.prototype.isActive = function (state) {
        if(this.is(state)) {
            return true;
        }
        return this.parent && this.parent.isActive(state) || false;
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
        var siblingSelector = this.siblingRegex.exec(path), selected = origin, sections;
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
        return selected && copy(selected.self) || undefined;
    };
    StateBrowser.prototype.selectSibling = function (index, selected) {
        var children = [], currentIndex = 0;
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
        }), toArray = this.buildStateArray(to, toParams), count = Math.max(fromArray.length, toArray.length), fromAtIndex, toAtIndex, stateChanges = false, paramChanges = !equals(fromParams, toParams);
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
        }, allFrom = c && c.$params.$all || {
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

/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../common.ts" />
/// <reference path="../interfaces.d.ts" />
/// <reference path="stateRules.ts" />
/// <reference path="stateFactory.ts" />
var Transition = (function () {
    function Transition(gotofn) {
        this.gotofn = gotofn;
        this.canceled = false;
    }
    Transition.prototype.cancel = function () {
        this.canceled = true;
    };
    Transition.prototype.goto = function (state, params) {
        this.cancel();
        this.gotofn({
            state: state,
            params: {
                all: params
            },
            updateroute: true
        });
    };
    return Transition;
})();

/**
* @ngdoc event
* @name dotjem.routing.directive:jemView#$viewContentLoaded
* @eventOf dotjem.routing.directive:jemView
*
* @eventType emit on the current jemView scope
*
* @description
* Emitted every time the jemView content is reloaded.
*/
/**
* @ngdoc event
* @name dotjem.routing.directive:jemView#$refresh
* @eventOf dotjem.routing.directive:jemView
*
* @eventType broadcast on the current jemView scope
*
* @description
* This event is broadcasted on the view scope unless the view scope defines a refresh function.
* <br/>
* Refresh happens for sticky views when the sticky flag remains the same during an update.
*
* @param {Object} angularEvent Synthetic event object.
* @param {string} name The name of the view where the broadcast originated.
* @param {Object} name Any data that may have been provided for a refresh.
*/
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
                        version = -1;
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
* Provides an anchor point for the {@link dotjem.routing.$scroll $scroll} service to use.
*
* @element ANY
* @param {string} jemAnchor|id Identifier of the anchor
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