'use strict';
function $TransitionProvider() {
    var root = {
        children: {
        },
        targets: {
        }
    }, validation = /^\w+(\.\w+)*(\.[*])?$/;
    this.onenter = function (state, onenter) {
        if(angular.isArray(onenter)) {
            angular.forEach(onenter, function (single) {
                onenter(single, state);
            });
        } else if(angular.isObject(onenter)) {
            this.transition(onenter.from || '*', state, onenter.handler);
        } else if(angular.isFunction(onenter)) {
            this.transition('*', state, onenter);
        }
    };
    this.onexit = function (state, onexit) {
        var _this = this;
        if(angular.isArray(onexit)) {
            angular.forEach(onexit, function (single) {
                _this.onexit(single, state);
            });
        } else if(angular.isObject(onexit)) {
            this.transition(state, onexit.to || '*', onexit.handler);
        } else if(angular.isFunction(onexit)) {
            this.transition(state, '*', onexit);
        }
    };
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
            from = toName(from);
            to = toName(to);
            validate(from, to);
            if(angular.isFunction(handler) || angular.isArray(handler)) {
                handler = {
                    between: handler
                };
            }
            transition = lookup(from);
            if(!(to in transition.targets)) {
                transition.targets[to] = [];
            }
            handler.name = from + ' -> ' + to;
            transition.targets[to].push(handler);
        }
        return this;
    };
    function toName(state) {
        return angular.isString(state) ? state : state.fullname;
    }
    function validate(from, to) {
        var fromValid = validateTarget(from), toValid = validateTarget(to);
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
    function lookup(name) {
        var current = root, names = name.split('.'), i = names[0] === 'root' ? 1 : 0;
        for(; i < names.length; i++) {
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
            function trimRoot(path) {
                if(path[0] === 'root') {
                    path.splice(0, 1);
                }
                return path;
            }
            function compare(one, to) {
                var left = trimRoot(one.split('.')).reverse(), right = trimRoot(to.split('.')).reverse(), l, r, i = 0;
                while(true) {
                    l = left.pop();
                    r = right.pop();
                    if(r === '*' || l === '*') {
                        return true;
                    }
                    if(l !== r) {
                        return false;
                    }
                    if(!isDefined(l) || !isDefined(r)) {
                        return true;
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
                do {
                    if('*' in current.children) {
                        transitions.push(current.children['*']);
                    }
                    if(names[index] in current.children) {
                        current = current.children[names[index]];
                        transitions.push(current);
                    } else {
                        break;
                    }
                }while(index++ < names.length);
                return transitions;
            }
        }    ];
}
angular.module('ui.routing').provider('$transition', $TransitionProvider);
