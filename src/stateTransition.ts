/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />

'use strict';

function $StateTransitionProvider() {
    var root = { children: { }, targets: { } },
        validation = /^\w+(\.\w+)*(\.[*])?$/,
        _this = this;

    function alignHandler(obj) {
        var result: any = { handler: {} };

        if (isDefined(obj.to))
            result.to = obj.to;

        if (isDefined(obj.from))
            result.from = obj.from;

        if (isDefined(obj.handler)) 
            result.handler = obj.handler;
        
        if (isDefined(obj.before) && isUndefined(result.handler.before)) 
            result.handler.before = obj.before;
        
        if (isDefined(obj.between) && isUndefined(result.handler.between)) 
            result.handler.between = obj.between;
        
        if (isDefined(obj.after) && isUndefined(result.handler.after)) 
            result.handler.after = obj.after;
        
        return result;
    }

    this.onEnter = function (state, onenter) {
        //TODO: Validation
        if (isObject(onenter)) {
            var aligned = alignHandler(onenter);
            this.transition(aligned.from || '*', state, aligned.handler);
        } else if (isFunction(onenter) || isArray(onenter)) {
            this.transition('*', state, onenter);
        }
    }

    this.onExit = function (state: any, onexit) {
        if (isObject(onexit)) {
            var aligned = alignHandler(onexit);
            this.transition(state, aligned.to || '*', aligned.handler);
        } else if (isFunction(onexit) || isArray(onexit)) {
            this.transition(state, '*', onexit);
        }
    }

    this.transition = function (from: any, to: any, handler: any) {
        var transition,
            regHandler;

        if (isArray(from)) {
            forEach(from, (value) => {
                this.transition(value, to, handler);
            });
        } else if (isArray(to)) {
            forEach(to, (value) => {
                this.transition(from, value, handler);
            });
        } else {
            from = toName(from);
            to = toName(to);

            // We ignore the situation where to and from are the same explicit state.
            // Reason to ignore is the array ways of registering transitions, it could easily happen that a fully named
            // state was in both the target and source array, and it would be a hassle for the user if he had to avoid that.
            if (to === from && to.indexOf('*') === -1)
                return this;

            validate(from, to);

            if (angular.isFunction(handler) || angular.isArray(handler)) {
                handler = {
                    between: handler
                };
            }

            transition = lookup(from);
            if (!(to in transition.targets)) {
                transition.targets[to] = [];
            }
            handler.name = from + ' -> ' + to;
            transition.targets[to].push(handler);
        }
        return this;
    };

    function validate(from: string, to: string) {
        var fromValid = validateTarget(from),
            toValid = validateTarget(to);

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
    
    function validateTarget(target: string) {
        if (target === '*' || validation.test(target))
            return true;
        return false;
    }
    
    function lookup(name: string) {
        var current = root,
            names = name.split('.'),
            //If name contains root explicitly, skip that one
            i = names[0] === 'root' ? 1:0;

        for (; i < names.length; i++) {
            if (!(names[i] in current.children))
                current.children[names[i]] = { children: {}, targets: {} }
            current = current.children[names[i]];
        }
        return current;
    }

    this.$get = [<any>'$q', '$injector',
    function ($q: ng.IQService, $injector: ng.auto.IInjectorService) {

        var $transition: any = {
            root: root,
            find: find
        };

        return $transition;

        function find(from, to) {
            var transitions = findTransitions(toName(from)),
                handlers = extractHandlers(transitions, toName(to)),
                emitters: any[];

            function emit(select, tc) {
                var handler;
                forEach(handlers, (handlerObj) => {
                    if (isDefined(handler = select(handlerObj))) {
                        $injector.invoke(handler, _this, {
                            $to: to,
                            $from: from,
                            $transition: tc
                        });
                    }
                });
            }

            return {
                before: function(tc) { emit(h => h.before, tc) },
                between: function (tc) { emit(h => h.between, tc) },
                after: function (tc) { emit(h => h.after, tc) },
            };
        }

        function trimRoot(path: string[]) {
            if (path[0] === 'root')
                path.splice(0,1);
            return path;
        }

        function compare(one: string, to: string) {
            var left = trimRoot(one.split('.')).reverse(),
                right = trimRoot(to.split('.')).reverse(),
                l, r, i = 0;

            while (true) {
                l = left.pop();
                r = right.pop();

                if (r === '*' || l === '*')
                    return true;

                if (l !== r)
                    return false;

                if (!isDefined(l) || !isDefined(r))
                    return true;
            }
            return true;
        }

        function extractHandlers(transitions, to) {
            var handlers = [];
            forEach(transitions, (t) => {
                forEach(t.targets, (target, targetName) => {
                    if (compare(targetName, to)) {
                        forEach(target, value => {
                            handlers.push(value);
                        });
                    }
                });
            });

            return handlers;
        }

        function findTransitions(from) {
            var current = root,
                names = from.split('.'),
                transitions = [],
                index = names[0] === 'root' ? 1: 0;

            do {
                if ('*' in current.children) {
                    transitions.push(current.children['*']);                }

                if (names[index] in current.children) {
                    current = current.children[names[index]];
                    transitions.push(current);
                } else {
                    break;
                }
            } while(index++ < names.length)
            return transitions;
        }
    }];
}
angular.module('ui.routing').provider('$stateTransition', $StateTransitionProvider);