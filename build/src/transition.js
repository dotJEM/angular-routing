'use strict';
function $TransitionProvider() {
    var root = {
        children: {
        },
        targets: {
        }
    }, validation = /^\w+(\.\w+)*(\.[*])?$/;
    function validate(from, to) {
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
    function validateTarget(target) {
        if(target === '*' || validation.test(target)) {
            return true;
        }
        return false;
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
    function lookupTransition(name) {
        var current = root, names = name.split('.');
        if(names[0] === 'root') {
            i++;
        }
        for(var i = 0; i < names.length; i++) {
            if(!(names[i] in current.children)) {
                current.children[names[i]] = {
                    children: {
                    },
                    targets: {
                    }
                };
            }
            current = current.children[names[i]];
        }
        return current;
    }
    this.transition = function (from, to, handler) {
        var _this = this;
        var transition, regHandler;
        if(angular.isArray(from)) {
            angular.forEach(from, function (value) {
                _this.transition(value, to, handler);
            });
        } else if(angular.isArray(to)) {
            angular.forEach(to, function (value) {
                _this.transition(from, value, handler);
            });
        } else {
            if(angular.isObject(from)) {
                from = from.fullname;
            }
            if(angular.isObject(to)) {
                to = to.fullname;
            }
            validate(from, to);
            if(angular.isFunction(handler) || angular.isArray(handler)) {
                handler = {
                    between: handler
                };
            }
            transition = lookupTransition(from);
            if(!(to in transition.targets)) {
                transition.targets[to] = [];
            }
            transition.targets[to].push(handler);
        }
        return this;
    };
    this.$get = [
        '$q', 
        '$injector', 
        function ($q, $injector) {
            var $transition = {
                root: root,
                find: find
            };
            return $transition;
            function find(from, to) {
                var transitions = findTransitions(from.fullname), handlers = extractHandlers(transitions, to.fullname), emitters;
                function emit(select, transitionControl) {
                    var handler;
                    angular.forEach(handlers, function (handlerObj) {
                        if(angular.isDefined(handler = select(handlerObj))) {
                            $injector.invoke(handler, null, {
                                $to: to,
                                $from: from,
                                $transition: transitionControl
                            });
                            return transitionControl;
                        }
                    });
                }
                return {
                    before: function (t) {
                        return emit(function (h) {
                            return h.before;
                        }, t);
                    },
                    between: function (t) {
                        return emit(function (h) {
                            return h.between;
                        }, t);
                    },
                    after: function (t) {
                        return emit(function (h) {
                            return h.after;
                        }, t);
                    }
                };
            }
            function compare(one, other) {
                var left = one.split('.'), right = other.split('.'), l, r, i = 0;
                while(true) {
                    l = left[i];
                    r = right[i];
                    i++;
                    if(l !== r && !(r === '*' || l === '*') || (i >= left.length || i >= right.length)) {
                        return false;
                    }
                }
                return true;
            }
            function extractHandlers(transitions, to) {
                var handlers = [];
                angular.forEach(transitions, function (t) {
                    angular.forEach(t.targets, function (target, targetName) {
                        if(compare(targetName, to)) {
                            angular.forEach(target, function (value) {
                                handlers.push(value);
                            });
                        }
                    });
                });
                return handlers;
            }
            function findTransitions(from) {
                var current = root, names = from.split('.'), transitions = [], index = names[0] === 'root' ? 1 : 0;
                for(; index < names.length; index++) {
                    if('*' in current.children) {
                        transitions.push(current.children['*']);
                    }
                    if(names[index] in current.children) {
                        current = current.children[names[index]];
                        transitions.push(current);
                    } else {
                        break;
                    }
                }
                return transitions;
            }
            function buildTransition(to, params) {
            }
        }    ];
}
angular.module('ui.routing').provider('$transition', $TransitionProvider);
