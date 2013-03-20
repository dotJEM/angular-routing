/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />

'use strict';
var $StateProvider = [<any>'$routeProvider', function ($routeProvider: ui.routing.IRouteProvider) {
    var root = { fullname: 'root', children: {}, self: {} },
        transition = { path: 'root', children: {} },
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

        if (!isDefined(reloadOnSearch))
            reloadOnSearch = true;

        route = (parrentRoute || '');
        if (route !== '' && route[route.length - 1] === '/')
            route = route.substr(0, route.length - 1);

        if (stateRoute[0] !== '/')
            route += '/';
        route += stateRoute;

        $routeProvider.when(route, { state: stateName, reloadOnSearch: reloadOnSearch });

        return route;
    }

    function registerEnterTransition(onenter, name) {
        //TODO: Validation

        if (angular.isArray(onenter))
        {
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
        at.self = state;
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

    function lookupTransition(names: string[]) {
        var current = transition;
        for (var i = 0; i < names.length; i++) {
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
        var transition;

        if (angular.isArray(from)) {
            angular.forEach(from, (value) => {
                this.transition(value, to, handler);
            });
        } else if (angular.isArray(to)) {
            angular.forEach(to, (value) => {
                this.transition(from, value, handler);
            });
        } else {
            validateTransition(from, to);



           
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
            current,
            $state: any = {
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
            if (currentRoute) {
                if (currentRoute.state) {
                    goto(currentRoute.state);
                } else if (currentRoute.action) {
                    $injector.invoke(currentRoute.action);
                }
            } else {
                goto(root);
            }
        }

        //function buildState(route, params, search) {
        //    var match = inherit(route, {
        //        self: inherit(route.self, {
        //            params: extend({}, search, params),
        //            pathParams: params
        //        })
        //    });
        //    return match;
        //}

        function buildTransition(to): any {
            if (angular.isString(to))
                to = lookupState(to);
            else
                to = lookupState(to.fullname);
            current = to;

            return {
                from: $state.current,
                to: inherit({ fullname: to.fullname }, to.self),
                emit: () => { },
                equals: () => {
                    return false;
                }
            }
        }

        function goto(to) {
            var tr = buildTransition(to),
                event,
                transaction,
                promise: ng.IPromise,
                event;

            //tr.emit();

            event = $rootScope.$broadcast('$stateChangeStart', tr.from, tr.to);
            if (!event.defaultPrevented) {
                $state.current = tr.to;

                promise = $q.when(tr.to);

                promise.then(() => {
                    //TODO: var corelation = $view.BeginUpdate(); ??
                    transaction = $view.beginUpdate();
                    //$view.clear();

                    //Should we pin views?
                    tr.emit();

                    angular.forEach(tr.to.views, (view, name) => {
                        $view.setOrUpdate(name, view.template, view.controller);
                    });

                    //Or let views be overwritten?
                    tr.emit();


                    //TODO: $view.EndUpdate(corelation); ??
                    $rootScope.$broadcast('$stateChangeSuccess', tr.to, tr.from);
                    transaction.commit();

                }, (error) => {
                    $rootScope.$broadcast('$stateChangeError', tr.to, tr.from, error);
                    transaction.cancel();

                }).then(() => {
                    tr.emit();
                });
            }
        }
    }];
}];
angular.module('ui.routing').provider('$state', $StateProvider);