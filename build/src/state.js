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
            $routeProvider.when(route, {
                state: stateName,
                reloadOnSearch: reloadOnSearch
            });
            return route;
        }
        function lookupRoute(parent) {
            while(isDefined(parent) && !isDefined(parent.route)) {
                parent = parent.parent;
            }
            return (parent && parent.route) || '';
        }
        var re = new RegExp('\x2F((:(\\w+))|(\\{((\\w+)(\\((.*?)\\))?:)?(\\w+)\\}))', 'g');
        function findParams(path) {
            var match, params = [];
            if(path === null) {
                return params;
            }
            while((match = re.exec(path)) !== null) {
                var paramName = match[3] || match[9];
                params.push(paramName);
            }
            return params;
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
                at.route = createRoute(state.route, lookupRoute(parent), fullname, state.reloadOnSearch);
                at.params = findParams(state.route);
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
                var forceReload = false, $state = {
                    root: root,
                    current: extend({
                    }, root.self),
                    goto: goto,
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
                    nextSibling: //TODO: Implement functions that return siblings etc.
                    '',
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
                    //TODO: Broadcast StateUpdate?
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
                            goto(route.state, params, route);
                        }
                        //TODO: Move Action to state instead?.
                        //if (route.action) {
                        //    $injector.invoke(route.action, { $params: params });
                        //}
                                            } else {
                        goto(root);
                    }
                }
                function isChanged(state, params) {
                    var old = $state.current.$params, oldPar = old && old.all || {
                    }, newPar = params.all, result = false;
                    forEach(state.params, function (name) {
                        //TODO: Implement an equals function that converts towards strings as this could very well
                        //      ignore an change on certain situations.
                        //
                        //      also change to a damn "forEach" where we can break out mid way...
                        result = oldPar[name] != newPar[name];
                    });
                    return result;
                }
                function changeChain(to, params) {
                    var states = [], lastChanged = 1, current = to;
                    while(current !== root) {
                        states.push(current);
                        if(isChanged(current, params)) {
                            lastChanged = states.length;
                        }
                        current = current.parent;
                    }
                    return {
                        states: states.reverse(),
                        first: states.length - lastChanged
                    };
                }
                function goto(to, params, route) {
                    //TODO: This list of declarations seems to indicate that we are doing more that we should in a single function.
                    //      should try to refactor it if possible.
                                        var to = lookupState(toName(to)), toState = extend({
                    }, to.self, {
<<<<<<< HEAD
                        $params: params
                    }), fromState = $state.current, emit = $transition.find($state.current, toState), cancel = false, event, transition, transaction, changed = changeChain(to, params);
=======
                        $params: params,
                        $route: route
                    }), fromState = $state.current, emit = $transition.find($state.current, toState), cancel = false, event, transaction, changed = changeChain(to, params), transition = {
                        cancel: function () {
                            cancel = true;
                        },
                        goto: function (state, params) {
                            cancel = true;
                            goto(state, params);
                        }
                    };
                    emit.before(transition);
                    if(cancel) {
                        //TODO: Should we do more here?... What about the URL?... Should we reset that to the privous URL?...
                        //      That is if this was even triggered by an URL change in teh first place.
                        return;
                    }
>>>>>>> cc088d09110acbb5da15e8759d547165bac04fb4
                    event = $rootScope.$broadcast('$stateChangeStart', toState, fromState);
                    if(!event.defaultPrevented) {
                        $q.when(toState).then(function () {
                            transaction = $view.beginUpdate();
                            $view.clear();
                            forEach(changed.states, function (state, index) {
                                forEach(state.self.views, function (view, name) {
                                    if(index < changed.first) {
                                        $view.setIfAbsent(name, view.template, view.controller);
                                    } else {
                                        $view.setOrUpdate(name, view.template, view.controller);
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
