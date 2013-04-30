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
            if(isDefined(state.route)) {
                at.route = createRoute(state.route, lookupRoute(parent), fullname, state.reloadOnSearch).$route;
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
                            params: params,
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
                    //TODO: Broadcast StateUpdate?
                                        var route = $route.current, params;
                    if(route) {
                        params = {
                            all: route.params,
                            path: route.pathParams,
                            search: route.searchParams
                        };
                        //TODO: Refresh current state object with new parameters and raise event.
                                            } else {
                        //uhm o.O...
                                            }
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
                    }), toArray = buildStateArray(to, toParams), count = Math.max(fromArray.length, toArray.length), fromAtIndex, toAtIndex;
                    for(var i = 0; i < count; i++) {
                        fromAtIndex = fromArray[fromArray.length - i - 1];
                        toAtIndex = toArray[toArray.length - i - 1];
                        if(isUndefined(fromAtIndex)) {
                            toAtIndex.changed = true;
                        } else if(isUndefined(toAtIndex)) {
                            toArray[0].changed = true;
                        } else // We wen't up the hierachy. for now make the parent dirty.
                        // however, this reloads the main view...
                        if(forceReload && forceReload == toAtIndex.state.fullname) {
                            toAtIndex.changed = true;
                        } else if(toAtIndex.state.fullname !== fromAtIndex.state.fullname) {
                            toAtIndex.changed = true;
                        } else if(!equals(toAtIndex.params, fromAtIndex.params)) {
                            toAtIndex.changed = true;
                        } else {
                            toAtIndex.changed = false;
                        }
                    }
                    return toArray.reverse();
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
                                params: params
                            });
                        }
                    };
                    if(args.updateroute && to.route) {
                        $route.change(extend({
                        }, to.route, {
                            params: params
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
                            var useUpdate = false;
                            transaction = $view.beginUpdate();
                            $view.clear();
                            forEach(changed, function (change, index) {
                                if(change.changed) {
                                    useUpdate = true;
                                }
                                forEach(change.state.self.views, function (view, name) {
                                    if(useUpdate) {
                                        $view.setOrUpdate(name, view.template, view.controller);
                                    } else {
                                        $view.setIfAbsent(name, view.template, view.controller);
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
                            current = to;
                            currentParams = params;
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
