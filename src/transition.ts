/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />

'use strict';

function $TransitionProvider() {
    var root = { children: { }, targets: { } },
        validation = /^\w+(\.\w+)*(\.[*])?$/;

    this.onenter = function (state, onenter) {
        //TODO: Validation
        if (angular.isArray(onenter)) {
            angular.forEach(onenter, (single) => {
                onenter(single, state);
            })
        } else if (angular.isObject(onenter)) {
            this.transition(onenter.from || '*', state, onenter.handler);
        } else if (angular.isFunction(onenter)) {
            this.transition('*', state, onenter);
        }
    }
    this.onexit = function (state: any, onexit) {
        //TODO: Validation
        if (angular.isArray(onexit)) {
            angular.forEach(onexit, (single) => {
                this.onexit(single, state);
            })
        } else if (angular.isObject(onexit)) {
            this.transition(state, onexit.to || '*', onexit.handler);
        } else if (angular.isFunction(onexit)) {
            this.transition(state, '*', onexit);
        }
    }
    this.transition = function (from: any, to: any, handler: any) {
        var transition,
            regHandler;

        if (angular.isArray(from)) {
            angular.forEach(from, (value) => {
                this.transition(value, to, handler);
            });
        } else if (angular.isArray(to)) {
            angular.forEach(to, (value) => {
                this.transition(from, value, handler);
            });
        } else {
            from = toName(from);
            to = toName(to);

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
            transition.targets[to].push(handler);
        }
        return this;
    };

    function toName(state: any) {
        return angular.isString(state) ? state : state.fullname;
    }

    function validate(from: string, to: string) {
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
            var transitions = findTransitions(from.fullname),
                handlers = extractHandlers(transitions, to.fullname),
                emitters: any[];

            function emit(select, transitionControl) {
                var handler;
                angular.forEach(handlers, (handlerObj) => {
                    if (angular.isDefined(handler = select(handlerObj))) {
                        $injector.invoke(handler, null, {
                            $to: to,
                            $from: from,
                            $transition: transitionControl
                        });
                        return transitionControl;
                    }
                })
            }

            return {
                before: t => emit(h => h.before, t),
                between: t => emit(h => h.between, t),
                after: t => emit(h => h.after, t)
            };
        }

        function compare(one: string, other: string) {
            var left = one.split('.'),
                right = other.split('.'),
                l, r, i = 0;

            while (true) {
                l = left[i]; r = right[i]; i++;
                if (l !== r && !(r === '*' || l === '*') || (i >= left.length || i >= right.length))
                    return false;
            }
            return true;
        }

        function extractHandlers(transitions, to) {
            var handlers = [];
            angular.forEach(transitions, (t) => {
                angular.forEach(t.targets, (target, targetName) => {
                    if (compare(targetName, to)) {
                        angular.forEach(target, value => {
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
                index = names[0] === 'root' ? 1 : 0;

            for (; index < names.length; index++) {
                if ('*' in current.children) {
                    transitions.push(current.children['*']);
                }

                if (names[index] in current.children) {
                    current = current.children[names[index]];
                    transitions.push(current);
                } else {
                    break;
                }
            }

            return transitions;
        }
    }];
}
angular.module('ui.routing').provider('$transition', $TransitionProvider);