/**
 * @license dotJEM Angular Routing
 * (c) 2012-2013 dotJEM (Jens Melgaard)
 * License: MIT
 *
 * @module angular-routing
 */
(function(window, document, undefined) {
/// <reference path="../lib/angular/angular-1.0.d.ts" />
/*jshint globalstrict:true*/
/*global angular:false*/
'use strict';
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
    if(isArray(arg)) {
        for(var i = 0; i < arg.length; i++) {
            if(i < arg.length - 1 && !isString(arg[i])) {
                return null;
            } else if(i === arg.length - 1 && isFunction(arg[i])) {
                return arg[i];
            }
        }
    }
    return null;
}
//var paramsRegex = new RegExp('\x2F((:(\\w+))|(\\{((\\w+)(\\((.*?)\\))?:)?(\\w+)\\}))', 'g');
//function parseParams(path: string): IParam[]{
//    var match: RegExpExecArray,
//        params = [];
//    if (path === null)
//        return params;
//    while ((match = paramsRegex.exec(path)) !== null) {
//        params.push({
//            name: match[3] || match[9],
//            converter: match[6] || '',
//            args: match[8],
//            index: match.index,
//            lastIndex: paramsRegex.lastIndex
//        });
//    }
//    return params;
//}
angular.module('ui.routing', []);

/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
'use strict';
/**
* Used for configuring routes. See {@link ui.routing.$route $route} for an example.
*
* @class $RouteProvider
* @constructor
*/
function $RouteProvider() {
    var _this = this;
    var routes = {
    }, converters = {
    }, decorators = {
    }, caseSensitive = true;
    //Public Methods
    /**
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
    *
    * @method convert
    * @return {Object} self
    *
    * @param {string} name Cerverter name, used in the path when registering routes through the
    *   {@link ui.routing.routeProvider#when when} function.
    */
    this.convert = function (name, converter) {
        //Note: We wan't to allow overwrite
        converters[name] = converter;
        return _this;
    };
    /**
    * Adds a new route definition to the `$route` service.
    *
    * @method when
    * @returns {Object} self
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
    *    More converters can be registered using the {@link ui.routing.routeProvider#convert convert}
    *    function.
    *
    * @param {Object} route Mapping information to be assigned to `$route.current` on route
    *    match.
    *
    *    Object properties:
    *
    *    - `state` � `{string}` � a state that should be activated when the route is matched.
    *    - `action` � `{(string|function()=}` � an action that should be performed when the route is matched.
    *
    *    Legacy support for the following when using the {@link ui.routing.legacy ui.routing.legacy}
    *    module.
    *
    *    - `controller` � `{(string|function()=}` � Controller fn that should be associated with newly
    *      created scope or the name of a {@link angular.Module#controller registered controller}
    *      if passed as a string.
    *    - `template` � `{string=|function()=}` � html template as a string or function that returns
    *      an html template as a string which should be used by {@link ng.directive:ngView ngView} or
    *      {@link ng.directive:ngInclude ngInclude} directives.
    *      This property takes precedence over `templateUrl`.
    *
    *      If `template` is a function, it will be called with the following parameters:
    *
    *      - `{Array.<Object>}` - route parameters extracted from the current
    *        `$location.path()` by applying the current route
    *
    *    - `templateUrl` � `{string=|function()=}` � path or function that returns a path to an html
    *      template that should be used by {@link ng.directive:ngView ngView}.
    *
    *      If `templateUrl` is a function, it will be called with the following parameters:
    *
    *      - `{Array.<Object>}` - route parameters extracted from the current
    *        `$location.path()` by applying the current route
    *
    *    - `resolve` - `{Object.<string, function>=}` - An optional map of dependencies which should
    *      be injected into the controller. If any of these dependencies are promises, they will be
    *      resolved and converted to a value before the controller is instantiated and the
    *      `$routeChangeSuccess` event is fired. The map object is:
    *
    *      - `key` � `{string}`: a name of a dependency to be injected into the controller.
    *      - `factory` - `{string|function}`: If `string` then it is an alias for a service.
    *        Otherwise if function, then it is {@link api/AUTO.$injector#invoke injected}
    *        and the return value is treated as the dependency. If the result is a promise, it is resolved
    *        before its value is injected into the controller.
    *
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
    * Sets route definition that will be used on route change when no other route definition
    * is matched.
    *
    * @method otherwise
    * @return {Object} self
    *
    * @param {Object} params Mapping information to be assigned to `$route.current`.
    */
    this.otherwise = function (route) {
        _this.when(null, route);
        return _this;
    };
    this.decorate = function (name, decorator) {
        //Note: We wan't to allow overwrite
        decorators[name] = decorator;
        return _this;
    };
    this.ignoreCase = function () {
        caseSensitive = false;
        return _this;
    };
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
        var result = [], name = "", index = 0;
        forEach(parseParams(url), function (param, idx) {
            if(param.converter !== '') {
                //TODO: use converter to convert param to string.
                            }
            name += url.slice(index, param.index) + '/' + params[param.name].toString();
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
                    var param, value;
                    if(!invalidParam) {
                        param = match[index + 1];
                        value = segment.converter()(param);
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
        return function (param) {
            var accepts = !isNaN(param);
            return {
                accept: accepts,
                value: accepts ? Number(param) : 0
            };
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
            throw new Error("The Regular-expression converter was not initialized with a valid object.");
        }
        regex = new RegExp(exp, flags);
        return function (param) {
            var accepts = regex.test(param);
            return {
                accept: accepts,
                value: accepts ? regex.exec(param) : null
            };
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
angular.module('ui.routing').provider('$route', $RouteProvider).value('$routeParams', {
});

/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
'use strict';
function $StateTransitionProvider() {
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
    this.onEnter = function (state, onenter) {
        //TODO: Validation
        if(isObject(onenter)) {
            var aligned = alignHandler(onenter);
            this.transition(aligned.from || '*', state, aligned.handler);
        } else if(isFunction(onenter) || isArray(onenter)) {
            this.transition('*', state, onenter);
        }
    };
    this.onExit = function (state, onexit) {
        if(isObject(onexit)) {
            var aligned = alignHandler(onexit);
            this.transition(state, aligned.to || '*', aligned.handler);
        } else if(isFunction(onexit) || isArray(onexit)) {
            this.transition(state, '*', onexit);
        }
    };
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
                            $injector.invoke(handler, _this, {
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
angular.module('ui.routing').provider('$stateTransition', $StateTransitionProvider);

'use strict';
var $StateProvider = [
    '$routeProvider', 
    '$stateTransitionProvider', 
    function ($routeProvider, $transitionProvider) {
        var root = {
            fullname: 'root',
            children: {
            },
            self: {
                $fullname: 'root'
            },
            reloadOnOptional: true
        }, nameValidation = /^\w+(\.\w+)*?$/;
        function validateName(name) {
            if(nameValidation.test(name)) {
                return;
            }
            throw new Error("Invalid name: '" + name + "'.");
        }
        function createRoute(stateRoute, parrentRoute, stateName, reloadOnSearch) {
            var route;
            route = (parrentRoute || '');
            if(route !== '' && route[route.length - 1] === '/') {
                route = route.substr(0, route.length - 1);
            }
            if(stateRoute[0] !== '/' && stateRoute !== '') {
                route += '/';
            }
            route += stateRoute;
            return $routeProvider.when(route, {
                state: stateName,
                reloadOnSearch: reloadOnSearch
            });
        }
        function lookupRoute(parent) {
            while(isDefined(parent) && !isDefined(parent.route)) {
                parent = parent.parent;
            }
            return (parent && parent.route.route) || '';
        }
        function registerState(name, at, state) {
            var fullname = at.fullname + '.' + name, parent = at;
            if(!isDefined(at.children)) {
                at.children = {
                };
            }
            if(!(name in at.children)) {
                at.children[name] = {
                };
            }
            at = at.children[name];
            at.self = extend({
            }, state, {
                $fullname: fullname
            });
            at.fullname = fullname;
            at.parent = parent;
            at.reloadOnOptional = !isDefined(state.reloadOnSearch) || state.reloadOnSearch;
            if(isDefined(state.route)) {
                at.route = createRoute(state.route, lookupRoute(parent), fullname, at.reloadOnOptional).$route;
            }
            if(isDefined(state.onEnter)) {
                $transitionProvider.onEnter(fullname, state.onEnter);
            }
            if(isDefined(state.onExit)) {
                $transitionProvider.onExit(fullname, state.onExit);
            }
            if(state.children === null) {
                at.children = {
                };
            } else {
                forEach(state.children, function (childState, childName) {
                    registerState(childName, at, childState);
                });
            }
        }
        function lookup(names) {
            var current = root, i = //If name contains root explicitly, skip that one
            names[0] === 'root' ? 1 : 0;
            for(; i < names.length; i++) {
                if(!(names[i] in current.children)) {
                    throw new Error("Could not locate '" + names[i] + "' under '" + current.fullname + "'.");
                }
                current = current.children[names[i]];
            }
            return current;
        }
        function lookupState(name) {
            return lookup(name.split('.'));
            ;
        }
        function lookupParent(name) {
            var names = name.split('.'), name = names.pop();
            return {
                at: lookup(names),
                name: name
            };
        }
        this.state = function (name, state) {
            var pair;
            validateName(name);
            pair = lookupParent(name);
            registerState(pair.name, pair.at, state);
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
            function ($rootScope, $q, $injector, $route, $view, $transition, $location) {
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
                    lookup: lookup,
                    reload: reload
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
                function lookup(path) {
                    var match = path.match('^\\$node\\(([-+]?\\d+)\\)$'), selected = current, sections;
                    if(match) {
                        selected = selectSibling(Number(match[1]), selected);
                    } else {
                        sections = path.split('/');
                        forEach(sections, function (sec) {
                            selected = select(sec, selected);
                        });
                    }
                    if(selected === root) {
                        throw new Error("Path expression out of bounds.");
                    }
                    return selected && extend({
                    }, selected.self) || undefined;
                }
                ;
                function selectSibling(index, selected) {
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
                }
                function select(exp, selected) {
                    if(exp === '.') {
                        if(current !== selected) {
                            throw new Error("Invalid path expression. Can only define '.' i the beginning of an expression.");
                        }
                        return selected;
                    }
                    if(exp === '..') {
                        if(isUndefined(selected.parent)) {
                            throw new Error("Path expression out of bounds.");
                        }
                        return selected.parent;
                    }
                    if(exp === '') {
                        if(current !== selected) {
                            throw new Error("Invalid path expression.");
                        }
                        return root;
                    }
                    var match = exp.match('^\\[(-?\\d+)\\]$');
                    if(match) {
                        var index = Number(match[1]), children = [];
                        forEach(selected.children, function (child) {
                            children.push(child);
                        });
                        if(Math.abs(index) >= children.length) {
                            throw new Error("Index out of bounds, index selecter must not exeed child count or negative childcount");
                        }
                        return index < 0 ? children[children.length + index] : children[index];
                    }
                    if(exp in selected.children) {
                        return selected.children[exp];
                    }
                    throw new Error("Could find state for the lookup path.");
                }
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
                function buildStateArray(state, params) {
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
                }
                function buildChangeArray(from, to, fromParams, toParams) {
                    var fromArray = buildStateArray(from, fromParams || {
                    }), toArray = buildStateArray(to, toParams), count = Math.max(fromArray.length, toArray.length), fromAtIndex, toAtIndex, c, stateChanges = false, paramChanges = !equals(fromParams, toParams);
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
                                        var params = args.params, route = args.route, to = lookupState(toName(args.state)), toState = extend({
                    }, to.self, {
                        $params: params,
                        $route: route
                    }), fromState = $state.current, emit = $transition.find($state.current, toState), cancel = false, transaction, changed = buildChangeArray(lookupState(toName($state.current)), to, fromState.$params && fromState.$params.all, params && params.all || {
                    }), transition = {
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
                                //var def = $q.defer();
                                //promise.then(function () {
                                //    resolve(change.state.self.resolve).then(function (locals) {
                                //        def.resolve(locals);
                                //    });
                                //});
                                //def.promise.then(function (locals) {
                                promise = promise.then(function () {
                                    return resolve(change.state.self.resolve);
                                }).then(function (locals) {
                                    //TODO: Locals is a promise here.
                                    if(change.isChanged) {
                                        useUpdate = true;
                                    }
                                    forEach(change.state.self.views, function (view, name) {
                                        var sticky;
                                        if(view.sticky) {
                                            sticky = view.sticky;
                                            if(isFunction(sticky) || isArray(sticky)) {
                                                sticky = $injector.invoke(sticky, sticky, {
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
                            }
                            //Note: nothing to do here.
                                                    });
                    }
                }
            }        ];
    }];
angular.module('ui.routing').provider('$state', $StateProvider);

/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
'use strict';
function $TemplateProvider() {
    var urlmatcher = new RegExp('^(((http|https|ftp)://([\\w-\\d]+\\.)+[\\w-\\d]+){0,1}(/?[\\w~,;\\-\\./?%&+#=]*))', 'i');
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
angular.module('ui.routing').provider('$template', $TemplateProvider);

/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
'use strict';
function $ViewProvider() {
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
            //this.setOrUpdate = function (name: string, args: { template?: any; controller?: any; locals?: any; sticky?: string; }) {
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
            //this.setIfAbsent = function (name: string, args: { template?: any; controller?: any; locals?: any; })
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
            this.get = function (name) {
                //TODO: return copies instead of actuals...
                if(isUndefined(name)) {
                    return views;
                }
                // Ensure checks if the view was defined at any point, not if it is still defined.
                // if it was defined but cleared, then null is returned which can be used to clear the view if desired.
                return views[name];
            };
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
angular.module('ui.routing').provider('$view', $ViewProvider);

/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
'use strict';
var $ScrollProvider = [
    '$anchorScrollProvider', 
    function ($anchorScrollProvider) {
        var autoscroll = false;
        //TODO: Consider this again... maybe we should just allow for a rerouted disable call?
        // $anchorScrollProvider.disableAutoScrolling();
        this.$get = [
            '$window', 
            '$rootScope', 
            '$location', 
            '$anchorScroll', 
            '$injector', 
            function ($window, $rootScope, $location, $anchorScroll, $injector) {
                var document = $window.document;
                function scrollTo(elm) {
                    if(elm) {
                        elm.scrollIntoView();
                    }
                }
                function scroll(arg) {
                    var fn;
                    if(isUndefined(arg)) {
                        $anchorScroll();
                    } else if(isString(arg)) {
                        if(arg === 'top') {
                            $window.scroll(0, 0);
                        } else {
                            scrollTo(angular.element(arg)[0]);
                        }
                        /****jQuery( "[attribute='value']"
                        * scrollTo: top - scroll to top, explicitly stated.
                        *           (This also enables one to override another scrollTo from a parent)
                        * scrollTo: null - don't scroll, not even to top.
                        * scrollTo: element-selector - scroll to an element id
                        * scrollTo: ['$stateParams', function($stateParams) { return stateParams.section; }
                        *           - scroll to element with id or view if starts with @
                        */
                                            } else if((fn = injectFn(arg)) !== null) {
                        scrollTo(angular.element($injector.invoke(arg, fn))[0]);
                    }
                }
                //if (autoscroll) {
                //    $rootScope.$watch(
                //        function () { return $location.hash(); },
                //        function () { $rootScope.$evalAsync(scroll); });
                //}
                return scroll;
            }        ];
    }];
angular.module('ui.routing').provider('$scroll', $ScrollProvider);

/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../interfaces.d.ts" />
/// <reference path="../common.ts" />
'use strict';
var uiViewDirective = [
    '$state', 
    '$scroll', 
    '$compile', 
    '$controller', 
    '$view', 
    '$animator', 
    function ($state, $scroll, $compile, $controller, $view, $animator) {
        return {
            restrict: 'ECA',
            terminal: true,
            link: function (scope, element, attr) {
                var viewScope, controller, name = attr['uiView'] || attr.name, doAnimate = isDefined(attr.ngAnimate), onloadExp = attr.onload || '', animate = $animator(scope, attr), version = -1;
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
                            //TODO: we are actually ending up calling scroll a number of times here due to multiple views.
                            $scroll();
                        });
                    } else {
                        clearContent(doAnimate);
                    }
                }
            }
        };
    }];
angular.module('ui.routing').directive('uiView', uiViewDirective);

})(window, document);