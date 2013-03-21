/* THIS IS A BANNER */ 
'use strict';
var isDefined = angular.isDefined, isFunction = angular.isFunction, isString = angular.isString, isObject = angular.isObject, forEach = angular.forEach, extend = angular.extend, copy = angular.copy;
function inherit(parent, extra) {
    return extend(new (extend(function () {
    }, {
        prototype: parent
    }))(), extra);
}
function merge(dst) {
    var args = [];
    for (var _i = 0; _i < (arguments.length - 1); _i++) {
        args[_i] = arguments[_i + 1];
    }
    forEach(arguments, function (obj) {
        if(obj !== dst) {
            forEach(obj, function (value, key) {
                if(!dst.hasOwnProperty(key)) {
                    dst[key] = value;
                }
            });
        }
    });
    return dst;
}
angular.module('ui.routing', []);

'use strict';
function $RouteProvider() {
    var _this = this;
    var routes = {
    }, converters = {
    }, decorators = {
    }, caseSensitive = true;
    this.convert = function (name, converter) {
        converters[name] = converter;
        return _this;
    };
    this.when = function (path, route) {
        var normalized = normalizePath(path);
        routes[normalized.name] = {
            self: angular.extend({
                reloadOnSearch: true
            }, route),
            redirect: createRedirector(route.redirectTo),
            match: createMatcher(path),
            path: path,
            params: normalized.params
        };
        return _this;
    };
    this.otherwise = function (route) {
        _this.when(null, route);
        return _this;
    };
    this.decorate = function (name, decorator) {
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
    function interpolate(url, params) {
        var result = [];
        angular.forEach((url || '').split(':'), function (segment, i) {
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
                    if(angular.isString(redirectTo)) {
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
            if(trimmed[0] === '{' && trimmed[trimmed.length - 1] === '}') {
                try  {
                    carg = angular.fromJson(trimmed);
                } catch (e) {
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
    var re = new RegExp('\x2F((:(\\w+))|(\\{((\\w+)(\\((.*?)\\))?:)?(\\w+)\\}))', 'g');
    function parseExpression(path) {
        var regex = "^", segments = [], index = 0, match, flags = '';
        if(path === '/') {
            return {
                complete: new RegExp('^[\x2F]$', flags),
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
            complete: new RegExp(regex + '\x2F?$', flags),
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
                invalidParam = false;
                angular.forEach(exp.segments, function (segment, index) {
                    if(!invalidParam) {
                        var param = match[index + 1], value = segment.converter(param);
                        if(angular.isDefined(value.accept)) {
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
        if(angular.isObject(arg) && angular.isDefined(arg.exp)) {
            exp = arg.exp;
            if(angular.isDefined(arg.flags)) {
                flags = arg.flags;
            }
        } else if(angular.isString(arg) && arg.length > 0) {
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
                        pathParams: params
                    })
                });
                return match;
            }
            function findroute(currentPath) {
                var params, match;
                angular.forEach(routes, function (route, path) {
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
                    angular.copy(nextRoute.params, $routeParams);
                    $rootScope.$broadcast('$routeUpdate', lastRoute);
                } else if(next || lastRoute) {
                    forceReload = false;
                    var event = $rootScope.$broadcast('$routeChangeStart', nextRoute, lastRoute);
                    if(!event.defaultPrevented) {
                        $route.current = nextRoute;
                        if(next) {
                            next.redirect($location, nextRoute);
                        }
                        var dp = $q.when(nextRoute);
                        if(nextRoute) {
                            angular.forEach(decorators, function (decorator, name) {
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
                    }
                }
            }
        }    ];
}
angular.module('ui.routing').provider('$route', $RouteProvider).value('$routeParams', {
});

'use strict';
var $StateProvider = [
    '$routeProvider', 
    function ($routeProvider) {
        var root = {
            fullname: 'root',
            children: {
            },
            self: {
            }
        }, transition = {
            path: 'root',
            children: {
            }
        }, nameValidation = /^\w+(\.\w+)*?$/, targetValiation = /^\w+(\.\w+)*(\.[*])?$/;
        function validateName(name) {
            if(nameValidation.test(name)) {
                return;
            }
            throw new Error("Invalid name: '" + name + "'.");
        }
        function validateTarget(target) {
            if(target === '*' || targetValiation.test(target)) {
                return true;
            }
            return false;
        }
        function validateTransition(from, to) {
            var fromValid = validateTarget(from);
            var toValid = validateTarget(to);
            if(fromValid && toValid) {
                return;
            }
            if(fromValid) {
                throw new Error("Invalid transition - to: '" + to + "'.");
            }
            if(toValid) {
                throw new Error("Invalid transition - from: '" + from + "'.");
            }
            throw new Error("Invalid transition - from: '" + from + "', to: '" + to + "'.");
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
        function registerEnterTransition(onenter, name) {
            if(angular.isArray(onenter)) {
                angular.forEach(onenter, function (single) {
                    registerEnterTransition(single, name);
                });
            } else if(angular.isObject(onenter)) {
                this.transition(onenter.from || '*', name, onenter.handler);
            } else if(angular.isFunction(onenter)) {
                this.transition('*', name, onenter);
            }
        }
        function registerExitTransition(onexit, name) {
            if(angular.isArray(onexit)) {
                angular.forEach(onexit, function (single) {
                    registerExitTransition(single, name);
                });
            } else if(angular.isObject(onexit)) {
                this.transition(name, onexit.to || '*', onexit.handler);
            } else if(angular.isFunction(onexit)) {
                this.transition(name, '*', onexit);
            }
        }
        function registerState(name, at, state) {
            var fullname = at.fullname + '.' + name, route, parent = at;
            if(!at.children) {
                at.children = {
                };
            }
            if(!(name in at.children)) {
                at.children[name] = {
                };
            }
            if(angular.isDefined(state.route)) {
                route = createRoute(state.route, at.fullRoute, fullname, state.reloadOnSearch);
            }
            if(angular.isDefined(state.onenter)) {
                registerEnterTransition(state.onenter, fullname);
            }
            if(angular.isDefined(state.onexit)) {
                registerExitTransition(state.onexit, fullname);
            }
            at = at.children[name];
            at.self = extend(state, {
                fullname: fullname
            });
            at.fullname = fullname;
            at.parent = parent;
            if(angular.isDefined(route)) {
                at.fullRoute = route;
            }
            if(state.children === null) {
                at.children = {
                };
            } else {
                angular.forEach(state.children, function (childState, childName) {
                    registerState(childName, at, childState);
                });
            }
        }
        function lookupTransition(names) {
            var current = transition;
            for(var i = 0; i < names.length; i++) {
                current = current.children[names[i]];
            }
            return current;
        }
        function lookup(names) {
            var current = root, i = 0;
            if(names[0] === 'root') {
                i++;
            }
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
            var _this = this;
            var transition;
            if(angular.isArray(from)) {
                angular.forEach(from, function (value) {
                    _this.transition(value, to, handler);
                });
            } else if(angular.isArray(to)) {
                angular.forEach(to, function (value) {
                    _this.transition(from, value, handler);
                });
            } else {
                if(angular.isObject(from)) {
                    from = from.fullname;
                }
                if(angular.isObject(to)) {
                    to = to.fullname;
                }
                validateTransition(from, to);
            }
            return this;
        };
        this.$get = [
            '$rootScope', 
            '$q', 
            '$injector', 
            '$route', 
            '$view', 
            function ($rootScope, $q, $injector, $route, $view) {
                var forceReload = false, current, $state = {
                    root: root,
                    troot: transition,
                    goto: goto,
                    nextSibling: '',
                    prevSibling: '',
                    parrent: '',
                    children: '',
                    reload: function () {
                        forceReload = true;
                        $rootScope.$evalAsync(update);
                    }
                };
                $rootScope.$on('$routeChangeSuccess', update);
                return $state;
                function update() {
                    var currentRoute = $route.current;
                    if(currentRoute) {
                        if(currentRoute.state) {
                            goto(currentRoute.state);
                        } else if(currentRoute.action) {
                            $injector.invoke(currentRoute.action);
                        }
                    } else {
                        goto(root);
                    }
                }
                function buildTransition(to) {
                    if(angular.isString(to)) {
                        to = lookupState(to);
                    } else {
                        to = lookupState(to.fullname);
                    }
                    current = to;
                    return {
                        from: $state.current,
                        to: inherit({
                            fullname: to.fullname
                        }, to.self),
                        emit: function () {
                        },
                        equals: function () {
                            return false;
                        }
                    };
                }
                function goto(to) {
                    var tr = buildTransition(to), event, transaction, promise, event;
                    event = $rootScope.$broadcast('$stateChangeStart', tr.from, tr.to);
                    if(!event.defaultPrevented) {
                        $state.current = tr.to;
                        promise = $q.when(tr.to);
                        promise.then(function () {
                            transaction = $view.beginUpdate();
                            tr.emit();
                            angular.forEach(tr.to.views, function (view, name) {
                                $view.setOrUpdate(name, view.template, view.controller);
                            });
                            tr.emit();
                            $rootScope.$broadcast('$stateChangeSuccess', tr.to, tr.from);
                            transaction.commit();
                        }, function (error) {
                            $rootScope.$broadcast('$stateChangeError', tr.to, tr.from, error);
                            transaction.cancel();
                        }).then(function () {
                            tr.emit();
                        });
                    }
                }
            }        ];
    }];
angular.module('ui.routing').provider('$state', $StateProvider);

'use strict';
function $TemplateProvider() {
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
                if(angular.isDefined(obj.url)) {
                    return getFromUrl(obj.url);
                }
                if(angular.isDefined(obj.fn)) {
                    return getFromFunction(obj.fn);
                }
                if(angular.isDefined(obj.html)) {
                    return $q.when(obj.html);
                }
                throw new Error("Object must define url, fn or html.");
            }
            this.get = function (template) {
                if(angular.isString(template)) {
                    return getFromUrl(template);
                }
                if(angular.isFunction(template)) {
                    return getFromFunction(template);
                }
                if(angular.isObject(template)) {
                    return getFromObject(template);
                }
                throw new Error("Template must be either an url as string, function or a object defining either url, fn or html.");
            };
            return this;
        }    ];
}
angular.module('ui.routing').provider('$template', $TemplateProvider);

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
                if(transaction) {
                    transaction.records[name] = (function () {
                        _this.clear(name);
                    });
                    return;
                }
                if(angular.isUndefined(name)) {
                    views = {
                    };
                } else {
                    views[name] = null;
                    raiseUpdated(name);
                }
            };
            this.setOrUpdate = function (name, template, controller) {
                var _this = this;
                ensureName(name);
                if(transaction) {
                    transaction.records[name] = (function () {
                        _this.setOrUpdate(name, template, controller);
                    });
                    return;
                }
                if(containsView(views, name)) {
                    views[name].template = $template.get(template);
                    views[name].controller = controller;
                    views[name].version++;
                } else {
                    views[name] = {
                        template: $template.get(template),
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
                    if(!containsView(transaction.records, name)) {
                        transaction.records[name] = (function () {
                            _this.setIfAbsent(name, template, controller);
                        });
                    }
                    return;
                }
                if(!containsView(views, name)) {
                    views[name] = {
                        template: $template.get(template),
                        controller: controller,
                        version: 0
                    };
                    raiseUpdated(name);
                }
            };
            this.get = function (name) {
                if(angular.isUndefined(name)) {
                    return views;
                }
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
                        angular.forEach(trx.records, function (fn) {
                            fn();
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
                var viewScope, name = attr[this.name] || attr.name, onloadExp = attr.onload || '';
                scope.$on('$stateChangeBegin', function () {
                });
                scope.$on('$viewChanged', function () {
                });
                scope.$on('$stateChangeSuccess', update);
                update();
                function resetScope(newScope) {
                    if(viewScope) {
                        viewScope.$destroy();
                    }
                    viewScope = newScope === 'undefined' ? null : newScope;
                }
                function clearContent() {
                    element.html('');
                    resetScope();
                }
                function update() {
                    var view = $view.get(name), controller = view.controller, version;
                    if(view.template) {
                        if(view.version === version) {
                            return;
                        }
                        version = view.version;
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
                        clearContent();
                    }
                }
            }
        };
    }];
angular.module('ui.routing').directive('uiView', uiViewDirective);
