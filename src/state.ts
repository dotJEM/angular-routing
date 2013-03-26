/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />

'use strict';
var $StateProvider = [<any>'$routeProvider', '$transitionProvider',function ($routeProvider: ui.routing.IRouteProvider, $transitionProvider) {
    var root = { fullname: 'root', children: {}, self: { fullname: 'root' } },
        nameValidation = /^\w+(\.\w+)*?$/;

    function validateName(name: string) {
        if (nameValidation.test(name))
            return;

        throw new Error("Invalid name: '" + name + "'.");
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
            $transitionProvider.onenter(fullname, state.onexit);
        }

        if (angular.isDefined(state.onexit)) {
            $transitionProvider.onexit(fullname, state.onexit);
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

    function lookup(names: string[]) {
        var current = root,
            //If name contains root explicitly, skip that one
            i = names[0] === 'root'?1:0;

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
        $transitionProvider.transition(from, to, handler);
        return this;
    };

    this.$get = [<any>'$rootScope', '$q', '$injector', '$route', '$view', '$transition',
    function (
        $rootScope: ng.IRootScopeService,
        $q: ng.IQService,
        $injector: ng.auto.IInjectorService,
        $route: ui.routing.IRouteService,
        $view: ui.routing.IViewService,
        $transition: ui.routing.ITransitionService) {

        var forceReload = false,
            $state: any = {
                root: root,
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
            return {
                from: fromState,
                to: toState,
                emit: $transition.find($state.current, toState)
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
                    $view.clear();

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