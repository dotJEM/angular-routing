(function(window, document, undefined) {
/// <reference path="../lib/angular/angular-1.0.d.ts" />
/*jshint globalstrict:true*/
/*global angular:false*/
'use strict';
var isDefined = angular.isDefined, isUndefined = angular.isUndefined, isFunction = angular.isFunction, isString = angular.isString, isObject = angular.isObject, isArray = angular.isArray, forEach = angular.forEach, extend = angular.extend, copy = angular.copy;
function inherit(parent, extra) {
    return extend(new (extend(function () {
    }, {
        prototype: parent
    }))(), extra);
}
function toName(named) {
    return isString(named) ? named : named.fullname;
}
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
        var normalized = normalizePath(path);
        routes[normalized.name] = {
            self: extend({
                reloadOnSearch: true
            }, route),
            redirect: createRedirector(route.redirectTo),
            match: createMatcher(path),
            path: path,
            params: normalized.params
        };
        return _this;
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
    function interpolate(url, params) {
        //TODO: We only support :params here, but that might be ok for now as we are constructing an url.
        var result = [];
        forEach((url || '').split(':'), function (segment, i) {
            if(i == 0) {
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
    function createSegment(match) {
        var cname = match[6] || '', carg = match[8], trimmed;
        if(carg) {
            trimmed = carg.trim();
            if((trimmed[0] === '{' && trimmed[trimmed.length - 1] === '}') || (trimmed[0] === '[' && trimmed[trimmed.length - 1] === ']')) {
                try  {
                    carg = angular.fromJson(trimmed);
                } catch (e) {
                    //Note: Errors are ok here, we let it remain as a string.
                                    }
            }
        }
        return {
            name: match[3] || match[9],
            converter: converters[cname](carg)
        };
    }
    var esc = /[-\/\\^$*+?.()|[\]{}]/g;
    function escape(exp) {
        return exp.replace(esc, "\\$&");
    }
    // NOTE: Hoisting brings the declaration (not assignment) of re to the top. I have left it here
    //       so it is only used in parseExpression, but defining it inside would case a new re on each
    //       call to parseExpression, and that is not needed.
    var re = new RegExp('\x2F((:(\\w+))|(\\{((\\w+)(\\((.*?)\\))?:)?(\\w+)\\}))', 'g');
    function parseExpression(path) {
        var regex = "^", segments = [], index = 0, match, flags = '';
        if(path === '/') {
            return {
                complete: //partial: new RegExp('^[\x2F].*$', flags),
                new RegExp('^[\x2F]$', flags),
                segments: []
            };
        }
        while((match = re.exec(path)) !== null) {
            regex += escape(path.slice(index, match.index));
            regex += '/([^\\/]*)';
            segments.push(createSegment(match));
            index = re.lastIndex;
        }
        regex += escape(path.substr(index));
        if(!caseSensitive) {
            flags += 'i';
        }
        if(regex[regex.length - 1] === '\x2F') {
            regex = regex.substr(0, regex.length - 1);
        }
        return {
            complete: //partial: new RegExp(regex + "\x2F?.*$", flags),
            new RegExp(regex + '\x2F?$', flags),
            segments: segments
        };
    }
    function normalizePath(path) {
        var name = "", index = 0, match, counter = 0, params = {
        };
        if(path === null) {
            return {
                name: null,
                params: params
            };
        }
        while((match = re.exec(path)) !== null) {
            var converter = match[6] || '', paramName = match[3] || match[9];
            params[paramName] = {
                id: counter,
                converter: converter
            };
            if(converter !== '') {
                converter = ":" + converter;
            }
            name += path.slice(index, match.index) + '/$' + (counter++) + converter;
            index = re.lastIndex;
        }
        name += path.substr(index);
        if(!caseSensitive) {
            name = name.toLowerCase();
        }
        return {
            name: name,
            params: params
        };
    }
    function createMatcher(path) {
        if(path == null) {
            return function (location) {
            };
        }
        var expFac = function () {
            var v = parseExpression(path);
            expFac = function () {
                return v;
            };
            return expFac();
        };
        return function (location) {
            var exp = expFac(), match = location.match(exp.complete), dst = {
            }, invalidParam;
            if(match) {
                //if (location.match(exp.complete)) {
                invalidParam = false;
                forEach(exp.segments, function (segment, index) {
                    var param, value;
                    if(!invalidParam) {
                        param = match[index + 1];
                        value = segment.converter(param);
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
                //} else {
                //TODO: Match nested routes
                //}
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
    }, validation = /^\w+(\.\w+)*(\.[*])?$/;
    this.onEnter = function (state, onenter) {
        //TODO: Validation
        if(isArray(onenter)) {
            forEach(onenter, function (single) {
                onenter(single, state);
            });
        } else if(isObject(onenter)) {
            this.transition(onenter.from || '*', state, onenter.handler);
        } else if(isFunction(onenter)) {
            this.transition('*', state, onenter);
        }
    };
    this.onExit = function (state, onexit) {
        var _this = this;
        //TODO: Validation
        if(isArray(onexit)) {
            forEach(onexit, function (single) {
                _this.onexit(single, state);
            });
        } else if(isObject(onexit)) {
            this.transition(state, onexit.to || '*', onexit.handler);
        } else if(isFunction(onexit)) {
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
                var transitions = findTransitions(from.fullname), handlers = extractHandlers(transitions, to.fullname), emitters;
                function emit(select, tc) {
                    var _this = this;
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
                fullname: 'root'
            }
        }, nameValidation = /^\w+(\.\w+)*?$/;
        function validateName(name) {
            if(nameValidation.test(name)) {
                return;
            }
            throw new Error("Invalid name: '" + name + "'.");
        }
        function createRoute(stateRoute, parrentRoute, stateName, reloadOnSearch) {
            var route;
            if(!isDefined(reloadOnSearch)) {
                reloadOnSearch = true;
            }
            route = (parrentRoute || '');
            if(route !== '' && route[route.length - 1] === '/') {
                route = route.substr(0, route.length - 1);
            }
            if(stateRoute[0] !== '/') {
                route += '/';
            }
            route += stateRoute;
            $routeProvider.when(route, {
                state: stateName,
                reloadOnSearch: reloadOnSearch
            });
            return route;
        }
        function lookupRoute(parent) {
            while(isDefined(parent) && !isDefined(parent.route)) {
                parent = parent.parent;
            }
            return (parent && parent.route) || '';
        }
        var re = new RegExp('\x2F((:(\\w+))|(\\{((\\w+)(\\((.*?)\\))?:)?(\\w+)\\}))', 'g');
        function findParams(path) {
            var match, params = [];
            if(path === null) {
                return params;
            }
            while((match = re.exec(path)) !== null) {
                var paramName = match[3] || match[9];
                params.push(paramName);
            }
            return params;
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
            at.self = extend(state, {
                fullname: fullname
            });
            at.fullname = fullname;
            at.parent = parent;
            if(isDefined(state.route)) {
                at.route = createRoute(state.route, lookupRoute(parent), fullname, state.reloadOnSearch);
                at.params = findParams(state.route);
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
        this.transition = function (from, to, handler) {
            $transitionProvider.transition(from, to, handler);
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
                var forceReload = false, $state = {
                    root: root,
                    current: inherit({
                    }, root),
                    goto: goto,
                    lookup: function (path) {
                        // XPath Inspired lookups
                        //
                        // /myState -> Selects myState from the root node.
                        // ./myState -> Selects myState as a child of the current node.
                        // ../myStaate -> Selects myState as a child of the parent node to this.
                        // /myState.$1 -> Selects the first child of myState
                        // /myState.$last -> Selects the last child of myState
                        // .$next -> Selects the next sibling of current element
                                            },
                    nextSibling: //TODO: Implement functions that return siblings etc.
                    '',
                    prevSibling: '',
                    parrent: '',
                    children: '',
                    reload: function () {
                        forceReload = true;
                        $rootScope.$evalAsync(update);
                    }
                };
                $rootScope.$on('$routeChangeSuccess', update);
                $rootScope.$on('$routeUpdate', function () {
                    //TODO: Broadcast StateUpdate?
                                    });
                return $state;
                function update() {
                    var route = $route.current, params;
                    if(route) {
                        params = {
                            all: route.params,
                            path: route.pathParams,
                            search: route.searchParams
                        };
                        if(route.state) {
                            goto(route.state, params);
                        }
                        //TODO: Move Action to state instead?.
                        //if (route.action) {
                        //    $injector.invoke(route.action, { $params: params });
                        //}
                                            } else {
                        goto(root);
                    }
                }
                function isChanged(state, params) {
                    var old = $state.current.params, oldPar = old && old.all || {
                    }, newPar = params.all, result = false;
                    forEach(state.params, function (name) {
                        //TODO: Implement an equals function that converts towards strings as this could very well
                        //      ignore an change on certain situations.
                        //
                        //      also change to a damn "forEach" where we can break out mid way...
                        result = oldPar[name] != newPar[name];
                    });
                    return result;
                }
                function changeChain(to, params) {
                    var states = [], lastChanged = 1, current = to;
                    while(current !== root) {
                        states.push(current);
                        if(isChanged(current, params)) {
                            lastChanged = states.length;
                        }
                        current = current.parent;
                    }
                    return {
                        states: states.reverse(),
                        first: states.length - lastChanged
                    };
                }
                function goto(to, params) {
                    //TODO: This list of declarations seems to indicate that we are doing more that we should in a single function.
                    //      should try to refactor it if possible.
                                        var to = lookupState(toName(to)), toState = inherit({
                        params: params
                    }, to.self), fromState = $state.current, emit = $transition.find($state.current, toState), cancel = false, event, transition, transaction, changed = changeChain(to, params);
                    event = $rootScope.$broadcast('$stateChangeStart', toState, fromState);
                    if(!event.defaultPrevented) {
                        transition = {
                            cancel: function () {
                                cancel = true;
                            },
                            goto: function (state, params) {
                                cancel = true;
                                goto(state, params);
                            }
                        };
                        emit.before(transition);
                        if(cancel) {
                            //TODO: Should we do more here?... What about the URL?... Should we reset that to the privous URL?...
                            //      That is if this was even triggered by an URL change in teh first place.
                            return;
                        }
                        $q.when(toState).then(function () {
                            transaction = $view.beginUpdate();
                            $view.clear();
                            forEach(changed.states, function (state, index) {
                                forEach(state.self.views, function (view, name) {
                                    if(index < changed.first) {
                                        $view.setIfAbsent(name, view.template, view.controller);
                                    } else {
                                        $view.setOrUpdate(name, view.template, view.controller);
                                    }
                                });
                            });
                            emit.between(transition);
                            if(cancel) {
                                transaction.cancel();
                                //TODO: Should we do more here?... What about the URL?... Should we reset that to the privous URL?...
                                //      That is if this was even triggered by an URL change in teh first place.
                                return;
                            }
                            $state.current = toState;
                            transaction.commit();
                            $rootScope.$broadcast('$stateChangeSuccess', toState, fromState);
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
    //var urlmatcher = new RegExp('^(?:(?:https?|ftp):\/\/)(?:\\S+(?::\\S*)?@)?(?:(?!10(?:\\.\\d{1,3}){3})(?!127(?:\\.\\d{1,3}){3})(?!169\\.254(?:\\.\\d{1,3}){2})(?!192\\.168(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\x{00a1}-\\x{ffff}0-9]+-?)*[a-z\\x{00a1}-\\x{ffff}0-9]+)(?:\\.(?:[a-z\\x{00a1}-\\x{ffff}0-9]+-?)*[a-z\\x{00a1}-\\x{ffff}0-9]+)*(?:\\.(?:[a-z\\x{00a1}-\\x{ffff}]{2,})))(?::\\d{2,5})?(?:\/[^\\s]*)?$', 'i');
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
                //TODO: Make a regular expression check and if it's not an URL just return it as is?
                if(isString(template)) {
                    return getFromUrl(template);
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
            function ensureExists(name) {
                if(!(name in views)) {
                    throw new Error('View with name "' + name + '" was not present.');
                }
            }
            ;
            function raiseUpdated(name) {
                $rootScope.$broadcast('$viewUpdate', name);
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
            this.setOrUpdate = function (name, template, controller) {
                var _this = this;
                ensureName(name);
                if(transaction) {
                    transaction.records[name] = {
                        act: 'setOrUpdate',
                        fn: function () {
                            _this.setOrUpdate(name, template, controller);
                        }
                    };
                    return;
                }
                if(containsView(views, name)) {
                    //TODO: Should we make this latebound so only views actually used gets loaded and rendered?
                    views[name].template = $template.get(template);
                    views[name].controller = controller;
                    views[name].version++;
                } else {
                    views[name] = {
                        template: //TODO: Should we make this latebound so only views actually used gets loaded and rendered?
                        $template.get(template),
                        controller: controller,
                        version: 0
                    };
                }
                raiseUpdated(name);
            };
            this.setIfAbsent = function (name, template, controller) {
                var _this = this;
                ensureName(name);
                if(transaction) {
                    if(!containsView(transaction.records, name) || transaction.records[name].act === 'clear') {
                        transaction.records[name] = {
                            act: 'setIfAbsent',
                            fn: function () {
                                _this.setIfAbsent(name, template, controller);
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

/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../interfaces.d.ts" />
/// <reference path="../common.ts" />
'use strict';
var uiViewDirective = [
    '$state', 
    '$anchorScroll', 
    '$compile', 
    '$controller', 
    '$view', 
    function ($state, $anchorScroll, $compile, $controller, $view) {
        return {
            restrict: 'ECA',
            terminal: true,
            link: function (scope, element, attr) {
                var viewScope, name = attr['uiView'] || attr.name, onloadExp = attr.onload || '', version = -1;
                scope.$on('$viewChanged', function (event, updatedName) {
                    if(updatedName === name) {
                        update();
                    }
                });
                scope.$on('$stateChangeSuccess', update);
                update();
                function resetScope(newScope) {
                    if(viewScope) {
                        viewScope.$destroy();
                    }
                    viewScope = newScope === 'undefined' ? null : newScope;
                }
                function update() {
                    var view = $view.get(name), controller;
                    if(view && view.template) {
                        if(view.version === version) {
                            return;
                        }
                        version = view.version;
                        controller = view.controller;
                        view.template.then(function (html) {
                            element.html(html);
                            resetScope(scope.$new());
                            var link = $compile(element.contents());
                            if(controller) {
                                controller = $controller(controller, {
                                    $scope: viewScope
                                });
                                element.contents().data('$ngControllerController', controller);
                            }
                            link(viewScope);
                            viewScope.$emit('$viewContentLoaded');
                            viewScope.$eval(onloadExp);
                            $anchorScroll();
                        });
                    } else {
                        element.html('');
                        resetScope();
                    }
                }
            }
        };
    }];
angular.module('ui.routing').directive('uiView', uiViewDirective);

})(window, document);