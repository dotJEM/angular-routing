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
            at.self = state;
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
