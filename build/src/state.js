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
