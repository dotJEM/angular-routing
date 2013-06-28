/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
/// <reference path="state/state.ts" />
/// <reference path="state/stateFactory.ts" />
/// <reference path="state/stateRules.ts" />
/// <reference path="state/stateComparer.ts" />
/// <reference path="state/stateBrowser.ts" />
'use strict';
var $StateProvider = [
    '$routeProvider', 
    '$stateTransitionProvider', 
    function ($routeProvider, $transitionProvider) {
        //TODO: Here we should just need to resolve a StateFactoryProvider allthough that name
        //      becomes quite crappy... not to mention that it ends up as a service provider that doesn't provide
        //      any services.
        var factory = new ui.routing.StateFactory($routeProvider, $transitionProvider);
        var root = factory.createState('root', {
        });
        var browser = new ui.routing.StateBrowser(root);
        var comparer = new ui.routing.StateComparer();
        this.state = function (fullname, state) {
            ui.routing.StateRules.validateName(fullname);
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
            function ($rootScope, $q, $injector, $route, $view, $transition, $location, $scroll) {
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
                    lookup: function (path) {
                        return browser.resolve(current, path);
                    },
                    reload: reload,
                    url: buildUrl
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
                function buildUrl(state, params) {
                    var c = $state.current;
                    state = isDefined(state) ? browser.lookup(toName(state)) : current;
                    if(!state.route) {
                        throw new Error("Can't build url for a state that doesn't have a url defined.");
                    }
                    //TODO: Find parent with route and return?
                    //TODO: This is very similar to what we do in buildStateArray -> extractParams,
                    //      maybe we can refactor those together
                                        var paramsObj = {
                    }, allFrom = (c && c.$params && c.$params.all) || {
                    };
                    forEach(state.route.params, function (param, name) {
                        if(name in allFrom) {
                            paramsObj[name] = allFrom[name];
                        }
                    });
                    return $route.format(state.route.route, extend(paramsObj, params || {
                    }));
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
                                        var params = args.params, route = args.route, to = browser.lookup(toName(args.state)), toState = // lookupState(toName(args.state)),
                    extend({
                    }, to.self, {
                        $params: params,
                        $route: route
                    }), fromState = $state.current, emit = $transition.find($state.current, toState), cancel = false, transaction, scrollTo, changed = comparer.compare(browser.lookup(toName($state.current)), to, fromState.$params && fromState.$params.all, params && params.all || {
                    }, forceReload), transition = {
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
                                promise = promise.then(function () {
                                    return resolve(change.state.self.resolve);
                                }).then(function (locals) {
                                    if(change.isChanged) {
                                        useUpdate = true;
                                    }
                                    scrollTo = change.state.self.scrollTo;
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
                                $scroll(scrollTo);
                            }
                            //Note: nothing to do here.
                                                    });
                    }
                }
            }        ];
    }];
angular.module('ui.routing').provider('$state', $StateProvider);
