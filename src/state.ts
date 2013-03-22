/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />

'use strict';
var $StateProvider = [<any>'$routeProvider', function ($routeProvider: ui.routing.IRouteProvider) {
    var root = { fullname: 'root', children: {}, self: { fullname: 'root' } },
        transition = { children: {}, targets: {} },
        nameValidation = /^\w+(\.\w+)*?$/,
        targetValiation = /^\w+(\.\w+)*(\.[*])?$/;

    function validateName(name: string) {
        if (nameValidation.test(name))
            return;

        throw new Error("Invalid name: '" + name + "'.");
    }

    function validateTarget(target: string) {
        if (target === '*' || targetValiation.test(target))
            return true;
        return false;
    }

    function validateTransition(from: string, to: string) {
        var fromValid = validateTarget(from);
        var toValid = validateTarget(to);
        if (fromValid && toValid) // && from !== to
            return;

        if (fromValid)
            throw new Error("Invalid transition - to: '" + to + "'.");

        if (toValid)
            throw new Error("Invalid transition - from: '" + from + "'.");

        //if (from === to && from.indexOf('*') === -1)
        //    throw new Error("Invalid transition - from and to can't be the same.");

        throw new Error("Invalid transition - from: '" + from + "', to: '" + to + "'.");
    }

    function createRoute(stateRoute: string, parrentRoute: string, stateName: string, reloadOnSearch: bool) {
        var route;

        if (!isDefined(reloadOnSearch)) {
            reloadOnSearch = true;
        }

        route = (parrentRoute || '');
        if (route !== '' && route[route.length - 1] === '/') {
            route = route.substr(0, route.length - 1);
        }

        if (stateRoute[0] !== '/')
            route += '/';
        route += stateRoute;

        $routeProvider.when(route, { state: stateName, reloadOnSearch: reloadOnSearch });

        return route;
    }

    function registerEnterTransition(onenter, name) {
        //TODO: Validation

        if (angular.isArray(onenter)) {
            angular.forEach(onenter, (single) => {
                registerEnterTransition(single, name);
            })
        } else if (angular.isObject(onenter)) {
            this.transition(onenter.from || '*', name, onenter.handler);
        } else if (angular.isFunction(onenter)) {
            this.transition('*', name, onenter);
        }
    }

    function registerExitTransition(onexit, name) {
        //TODO: Validation

        if (angular.isArray(onexit)) {
            angular.forEach(onexit, (single) => {
                registerExitTransition(single, name);
            })
        } else if (angular.isObject(onexit)) {
            this.transition(name, onexit.to || '*', onexit.handler);
        } else if (angular.isFunction(onexit)) {
            this.transition(name, '*', onexit);
        }
    }

    function registerState(name, at, state) {
        var fullname = at.fullname + '.' + name,
            route: string,
            parent = at;

        if (!at.children) {
            at.children = {};
        }

        if (!(name in at.children)) {
            at.children[name] = {};
        }

        if (angular.isDefined(state.route)) {
            route = createRoute(state.route, at.fullRoute, fullname, state.reloadOnSearch);
        }

        if (angular.isDefined(state.onenter)) {
            registerEnterTransition(state.onenter, fullname);
        }

        if (angular.isDefined(state.onexit)) {
            registerExitTransition(state.onexit, fullname);
        }

        at = at.children[name];
        at.self = extend(state, { fullname: fullname });
        at.fullname = fullname;
        at.parent = parent;
        if (angular.isDefined(route))
            at.fullRoute = route;

        if (state.children === null) {
            at.children = {};
        } else {
            angular.forEach(state.children, (childState, childName) => {
                registerState(childName, at, childState);
            });
        }
    }

    function lookupTransition(name: string) {
        var current = transition,
            names = name.split('.');

        //If name contains root explicitly, skip that one
        if (names[0] === 'root')
            i++;

        for (var i = 0; i < names.length; i++) {
            if (!(names[i] in current.children)) {
                current.children[names[i]] = { children: {}, targets: {} }
            }
            current = current.children[names[i]];
        }
        return current;
    }

    function lookup(names: string[]) {
        var current = root,
            i = 0;

        //If name contains root explicitly, skip that one
        if (names[0] === 'root')
            i++;

        for (; i < names.length; i++) {
            if (!(names[i] in current.children))
                throw new Error("Could not locate '" + names[i] + "' under '" + current.fullname + "'.");

            current = current.children[names[i]];
        }
        return current;
    }

    function lookupState(name: string): any {
        return lookup(name.split('.'));;
    }

    function lookupParent(name: string) {
        var names: string[] = name.split('.'),
            name: string = names.pop();
        return { at: lookup(names), name: name };
    }

    this.state = function (name: string, state: any) {
        var pair;
        validateName(name);

        pair = lookupParent(name);
        registerState(pair.name, pair.at, state);
        return this;
    };

    this.transition = function (from: any, to: any, handler: any) {
        var transition,
            regHandler;

        if (angular.isArray(from)) {
            angular.forEach(from, (value) => {
                this.transition(value, to, handler);
            });
        } else if (angular.isArray(to)) {
            angular.forEach(to, (value) => {
                this.transition(from, value, handler);
            });
        } else {
            if (angular.isObject(from)) {
                from = from.fullname;
            }

            if (angular.isObject(to)) {
                to = to.fullname;
            }

            validateTransition(from, to);

            if (angular.isFunction(handler) || angular.isArray(handler)) {
                handler = {
                    between: handler
                };
            }


            transition = lookupTransition(from);
            if (!(to in transition.targets)) {
                transition.targets[to] = [];
            }
            transition.targets[to].push(handler);
        }
        return this;
    };

    this.$get = [<any>'$rootScope', '$q', '$injector', '$route', '$view',
    function (
        $rootScope: ng.IRootScopeService,
        $q: ng.IQService,
        $injector: ng.auto.IInjectorService,
        $route: ui.routing.IRouteService,
        $view: ui.routing.IViewService) {

        var forceReload = false,
            //current,
            $state: any = {
                root: root,
                transition: transition,
                current: inherit({}, root),
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
        $rootScope.$on('$routeUpdate', () => {
            //TODO: Broadcast StateUpdate.
        });
        return $state;

        function update() {
            var route = $route.current,
                params;
            if (route) {
                params = {
                    all: route.params,
                    path: route.pathParams,
                    search: route.searchParams
                };

                if (route.state) {
                    goto(route.state, params);
                } else if (route.action) {
                    $injector.invoke(route.action, { $params: params });
                }
            } else {
                goto(root);
            }
        }

        function compateTarget(one: string, other: string) {
            var left = one.split('.'),
                right = other.split('.'),
                l, r, i = 0;

            while (true) {
                l = left[i]; r = right[i]; i++;
                if (l !== r) {
                    if (r === '*' || l === '*')
                        return true;
                    return false;
                }
            }
        }

        function findHandlers(from: string, to: string): any[] {
            var current = transition,
                names = from.split('.'),
                transitions = [],
                handlers = [];

            //If name contains root explicitly, skip that one
            if (names[0] === 'root') {
                i++;
            }

            for (var i = 0; i < names.length; i++) {
                if ('*' in current.children) {
                    transitions.push(current.children['*']);
                }

                if (names[i] in current.children) {
                    current = current.children[names[i]];
                    transitions.push(current);
                } else {
                    break;
                }
            }

            angular.forEach(transitions, (t) => {
                angular.forEach(t.targets, (target, targetName) => {
                    if (compateTarget(targetName, to)) {
                        angular.forEach(target, value => {
                            handlers.push(value);
                        });
                    }
                });
            });
            return handlers;
        }

        function buildTransition(to, params?: { all; path; search; }): any {
            var handlers: any[],
                emitters,
                toState,
                fromState = $state.current;

            if (angular.isString(to)) {
                to = lookupState(to);
            } else {
                to = lookupState(to.fullname);
            }

            //Note: Copy it so any thing the receiver does to the object dies after.
            toState = inherit({}, to.self);

            handlers = findHandlers(($state.current && $state.current.fullname) || 'root', to.fullname);

            function emit(select, transitionControl) {
                var handler;
                angular.forEach(handlers, (handlerObj) => {
                    if (angular.isDefined(handler = select(handlerObj))) {
                        $injector.invoke(handler, null, {
                            $to: toState,
                            $from: fromState,
                            $transition: transitionControl 
                        });
                        return transitionControl;
                    }
                })
            }

            return {
                from: fromState,
                to: toState,
                emit: {
                    before: t => emit(h => h.before, t),
                    between: t => emit(h => h.between, t),
                    after: t => emit(h => h.after, t)
                }
            }
        }

        function goto(to, params?) {
            var t = buildTransition(to, params), tr,
                event, transaction, promise: ng.IPromise;


            event = $rootScope.$broadcast('$stateChangeStart', t.from, t.to);
            if (!event.defaultPrevented) {
                tr = { cancel: false };
                tr = t.emit.before(tr);
                //TODO: Reach to TR.

                $state.current = t.to;

                promise = $q.when(t.to);

                promise.then(() => {
                    //TODO: var corelation = $view.BeginUpdate(); ??
                    transaction = $view.beginUpdate();
                    //$view.clear();

                    //Should we pin views?
                    //tr.emit.between();

                    angular.forEach(t.to.views, (view, name) => {
                        $view.setOrUpdate(name, view.template, view.controller);
                    });

                    //Or let views be overwritten?
                    t.emit.between(tr);
                    //TODO: Reach to TR.

                    //TODO: $view.EndUpdate(corelation); ??
                    $rootScope.$broadcast('$stateChangeSuccess', t.to, t.from);
                    transaction.commit();

                }, (error) => {
                    $rootScope.$broadcast('$stateChangeError', t.to, t.from, error);
                    transaction.cancel();

                }).then(() => {
                    t.emit.after(tr);
                    //TODO: Reach to TR.
                });
            }
        }
    }];
}];
angular.module('ui.routing').provider('$state', $StateProvider);