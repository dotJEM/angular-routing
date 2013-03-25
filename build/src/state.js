'use strict';
var $StateProvider = [
    '$routeProvider', 
    '$transitionProvider', 
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
            $transitionProvider.transition(from, to, handler);
            return this;
        };
        this.$get = [
            '$rootScope', 
            '$q', 
            '$injector', 
            '$route', 
            '$view', 
            '$transition', 
            function ($rootScope, $q, $injector, $route, $view, $transition) {
                var forceReload = false, $state = {
                    root: root,
                    current: inherit({
                    }, root),
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
                $rootScope.$on('$routeUpdate', function () {
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
                        } else if(route.action) {
                            $injector.invoke(route.action, {
                                $params: params
                            });
                        }
                    } else {
                        goto(root);
                    }
                }
                function buildTransition(to, params) {
                    var handlers, emitters, toState, fromState = $state.current;
                    if(angular.isString(to)) {
                        to = lookupState(to);
                    } else {
                        to = lookupState(to.fullname);
                    }
                    toState = inherit({
                    }, to.self);
                    return {
                        from: fromState,
                        to: toState,
                        emit: $transition.find($state.current, toState)
                    };
                }
                function goto(to, params) {
                    var t = buildTransition(to, params), tr, event, transaction, promise;
                    event = $rootScope.$broadcast('$stateChangeStart', t.from, t.to);
                    if(!event.defaultPrevented) {
                        tr = {
                            cancel: false
                        };
                        tr = t.emit.before(tr);
                        $state.current = t.to;
                        promise = $q.when(t.to);
                        promise.then(function () {
                            transaction = $view.beginUpdate();
                            angular.forEach(t.to.views, function (view, name) {
                                $view.setOrUpdate(name, view.template, view.controller);
                            });
                            t.emit.between(tr);
                            $rootScope.$broadcast('$stateChangeSuccess', t.to, t.from);
                            transaction.commit();
                        }, function (error) {
                            $rootScope.$broadcast('$stateChangeError', t.to, t.from, error);
                            transaction.cancel();
                        }).then(function () {
                            t.emit.after(tr);
                        });
                    }
                }
            }        ];
    }];
angular.module('ui.routing').provider('$state', $StateProvider);
