/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />

interface IStateWrapper {
    children: any;
    self: ui.routing.IState;
    fullname: string;

    parent?: IStateWrapper;
    route?: string;
    params?: string[];
}

'use strict';
var $StateProvider = [<any>'$routeProvider', '$stateTransitionProvider', function ($routeProvider: ui.routing.IRouteProvider, $transitionProvider) {
    var root: IStateWrapper = { fullname: 'root', children: {}, self: { $fullname: 'root' } },
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

    function lookupRoute(parent) {
        while (isDefined(parent) && !isDefined(parent.route))
            parent = parent.parent;
        return (parent && parent.route) || '';
    }

    var re = new RegExp('\x2F((:(\\w+))|(\\{((\\w+)(\\((.*?)\\))?:)?(\\w+)\\}))', 'g');
    function findParams(path: string) {
        var match: RegExpExecArray,
            params = [];

        if (path === null)
            return params;

        while ((match = re.exec(path)) !== null) {
            var paramName = match[3] || match[9];
            params.push(paramName);
        }

        return params;
    }

    function registerState(name, at: IStateWrapper, state: ui.routing.IState) {
        var fullname = at.fullname + '.' + name,
            parent = at;

        if (!isDefined(at.children)) {
            at.children = {};
        }

        if (!(name in at.children)) {
            at.children[name] = {};
        }
        at = at.children[name];
        at.self = extend({}, state, { $fullname: fullname });
        at.fullname = fullname;
        at.parent = parent;

        if (isDefined(state.route)) {
            at.route = createRoute(state.route, lookupRoute(parent), fullname, state.reloadOnSearch);
            at.params = findParams(state.route);
        }

        if (isDefined(state.onEnter)) {
            $transitionProvider.onEnter(fullname, state.onEnter);
        }

        if (isDefined(state.onExit)) {
            $transitionProvider.onExit(fullname, state.onExit);
        }

        if (state.children === null) {
            at.children = {};
        } else {
            forEach(state.children, (childState, childName) => {
                registerState(childName, at, childState);
            });
        }
    }

    function lookup(names: string[]) {
        var current = root,
            //If name contains root explicitly, skip that one
            i = names[0] === 'root' ? 1 : 0;

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

    this.state = function (name: string, state: ui.routing.IState) {
        var pair;
        validateName(name);

        pair = lookupParent(name);
        registerState(pair.name, pair.at, state);
        return this;
    };

    this.$get = [<any>'$rootScope', '$q', '$injector', '$route', '$view', '$stateTransition', '$location',
    function (
        $rootScope: ng.IRootScopeService,
        $q: ng.IQService,
        $injector: ng.auto.IInjectorService,
        $route: ui.routing.IRouteService,
        $view: ui.routing.IViewService,
        $transition: ui.routing.ITransitionService,
        $location: ng.ILocationService) {

        var forceReload = null,
            current = root,
            currentParams = {},
            $state: any = {
                root: root,
                current: extend({}, root.self),
                goto: (state, params) => { goto(state, params); },

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

                //TODO: Implement functions that return siblings etc.
                nextSibling: '',
                prevSibling: '',
                parrent: function () {
                    //TODO: Temporary implementation, we need to enable fetching these tings from current so we can keep navigating up.
                    return extend({}, current.parent.self, { $params: currentParams, $route: $route.current });
                },
                children: '',
                reload: function (state?) {

                    if (isDefined(state)) {
                        if (isString(state) || isObject(state)) { 
                            forceReload = toName(state);
                            //TODO: We need some name normalization OR a set of "compare" etc methods that can ignore root.
                            if (forceReload.indexOf('root') !== 0) {
                                forceReload = 'root.' + forceReload;
                            }
                            //console.log('forceReload (toName(state)): ' + forceReload);
                        } else if (state) {
                            forceReload = root.fullname;
                            console.log('forceReload (root.fullname): ' + forceReload);
                        }
                    } else {
                        forceReload = current.fullname;
                        console.log('forceReload (current.fullname): ' + forceReload);
                    }

                    $rootScope.$evalAsync(() => {
                        goto(current, currentParams, $route.current)
                    });
                }
            };

        $rootScope.$on('$routeChangeSuccess', function () {
            var route = $route.current,
                params;
            if (route) {
                params = {
                    all: route.params,
                    path: route.pathParams,
                    search: route.searchParams
                };

                if (route.state) {
                    goto(route.state, params, route);
                }
            } else {
                goto(root);
            }
        });
        $rootScope.$on('$routeUpdate', () => {
            //TODO: Broadcast StateUpdate?
        });
        return $state;
        
        function buildStateArray(state, params) {
            function extractParams() {
                var paramsObj = {};
                forEach(current.params, (name) => {
                    paramsObj[name] = params[name];
                });
                return paramsObj;
            }

            var states = [],
                current = state;
            do {
                states.push({ state: current, params: extractParams() });
            } while (current = current.parent)
            return states;
        }

        function buildChangeArray(from, to, fromParams, toParams) {
            var fromArray = buildStateArray(from, fromParams || {}),
                toArray = buildStateArray(to, toParams),
                count = Math.max(fromArray.length, toArray.length),
                fromAtIndex,
                toAtIndex;

            for (var i = 0; i < count; i++) {
                fromAtIndex = fromArray[fromArray.length - i - 1];
                toAtIndex = toArray[toArray.length - i - 1];
                
                if (isUndefined(fromAtIndex))
                    toAtIndex.changed = true;
                else if (isUndefined(toAtIndex))
                    toArray[0].changed = true; 
                    // We wen't up the hierachy. for now make the parent dirty.
                    // however, this reloads the main view... 
                else if (forceReload && forceReload == toAtIndex.state.fullname)
                    toAtIndex.changed = true;
                else if (toAtIndex.state.fullname !== fromAtIndex.state.fullname)
                    toAtIndex.changed = true;
                else if (!equals(toAtIndex.params, fromAtIndex.params))
                    toAtIndex.changed = true;
                else
                    toAtIndex.changed = false;
            }
            return toArray.reverse();
        }

        function goto(to, params?, route?) {
            //TODO: This list of declarations seems to indicate that we are doing more that we should in a single function.
            //      should try to refactor it if possible.
            var to = lookupState(toName(to)),
                toState = extend({}, to.self, { $params: params, $route: route }),
                fromState = $state.current,
                emit = $transition.find($state.current, toState),

                cancel = false,
                event,
                transaction,
                changed = buildChangeArray(
                    lookupState(toName($state.current)),
                    to,
                    fromState.$params && fromState.$params.all,
                    params.all || {}),

                transition = {
                    cancel: function () {
                        cancel = true;
                    },
                    goto: (state, params?) => {
                        cancel = true;
                        goto(state, params);
                    }
                };

            emit.before(transition);
            if (cancel) {
                //TODO: Should we do more here?... What about the URL?... Should we reset that to the privous URL?...
                //      That is if this was even triggered by an URL change in teh first place.
                return;
            }

            event = $rootScope.$broadcast('$stateChangeStart', toState, fromState);
            if (!event.defaultPrevented) {
                $q.when(toState).then(() => {
                    var useUpdate = false;

                    transaction = $view.beginUpdate();
                    $view.clear();

                    forEach(changed, (change, index) => {
                        if (change.changed)
                            useUpdate = true;
                        forEach(change.state.self.views, (view, name) => {
                            if (useUpdate) {
                                $view.setOrUpdate(name, view.template, view.controller);
                            } else {
                                $view.setIfAbsent(name, view.template, view.controller);
                            }
                        });
                    });

                    emit.between(transition);

                    if (cancel) {
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
                }, (error) => {
                    transaction.cancel();
                    $rootScope.$broadcast('$stateChangeError', toState, fromState, error);
                }).then(() => {
                    if (!cancel) {
                        transition.cancel = function () {
                            throw Error("Can't cancel transition in after handler");
                        };
                        emit.after(transition);
                    }
                    //Note: nothing to do here.
                });
            }
        }
    }];
}];
angular.module('ui.routing').provider('$state', $StateProvider);