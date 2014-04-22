/// <reference path="refs.d.ts" />

/**
 * @ngdoc object
 * @name dotjem.routing.$stateTransitionProvider
 *
 * @description
 * Use the `$stateTransitionProvider` to configure handlers for transitions between states.
 * <br/>
 * The transition handlers allows for canceling a transition, e.g. if it is invalid or rerouting it to another state.
 * They can also be used to perform steps that should only be performed as part of a specific transition from e.g. state 'A' to state 'B', but not 'C' to 'B'.
 * <br/>
 * Besides the more general {@link dotjem.routing.$stateTransitionProvider#transition transition} method, specialized configuration methods exists for entering and leaving states.
 * These specialized cases can also be configured on the states instead of using the `$stateTransitionProvider`. See {@link dotjem.routing.$stateProvider $stateProvider} for more information about that.
 * <br/>
 * ### Transition Handlers
 * Handlers for transitions can be specified in a number of ways, where the most simple handler is an injectable `function`.
 * <br/>
 * Here is a basic example:
 * <pre dx-syntax class="brush: js">
 *  angular.module('demo', ['dotjem.routing'])
 *    .config(['$stateTransitionProvider', function(stp) {
 *      stp
 *       .transition('locked', 'closed', ['$transition', function($transition) { 
 *         console.log('Door was unlocked'); 
 *       }])
 *       .transition('locked', 'open', ['$transition', function($transition) { 
 *         console.log("Can't open a locked door!");
 *         $transition.cancel();
 *       }])
 *       .transition('open', 'closed', ['$transition', function($transition) {
 *         console.log('Door was closed'); 
 *       }])
 *       .transition('open', 'locked', ['$transition', function($transition) {
 *         console.log("Can't lock an open door!");
 *         $transition.cancel();
 *       }])
 *       .transition('closed', 'open', ['$transition', function($transition) {
 *         console.log('Door was opened'); 
 *       }])
 *       .transition('closed', 'locked', ['$transition', function($transition) {
 *         console.log('Door was locked'); 
 *       }])
 *    }]);
 * </pre>
 * #### Handler Stages
 * The example above describes how simple handlers can be registered, however handlers can also be specified to be called at specific transition stages.
 * <br/>
 * Basically this boils down to `before`, `between`, `after`. The flow of these will be:
 * 
 * 1. Handler: `before`
 * 2. Event: `$stateChangeStart`
 * 3. Resolve: Views, Dependencies etc.
 * 4. Handler: `between`
 * 5. Event: `$stateChangeSuccess` or `$stateChangeError`
 * 6. Handler: `after`
 * 
 * When registering transitions like demonstrated in the example above, this will be maped to the "between" stage.
 * <br/>
 * To target specific stages of a transition use a transition object instead as in the example below:
 * <pre dx-syntax class="brush: js">
 *  angular.module('demo', ['dotjem.routing'])
 *    .config(['$stateTransitionProvider', function(stp) {
 *      stp
 *       .transition('closed', 'open', {
 *         before: ['$transition', function($transition) { 
 *           console.log('We are about to open the door.');
 *         }],
 *         between: ['$transition', function($transition) {
 *           console.log('We are opening the door.');
 *         }],
 *         after: ['$transition', function($transition) { 
 *           console.log('We have opened the door.');
 *         }]
 *       }])
 *    }]);
 * </pre>
 * Here we defined a handler for all stages, each stage is optional however, so if we just wished to be called before the transition started, we could leave the `between` and `after` out of it:
 * <pre>
 *  angular.module('demo', ['dotjem.routing'])
 *    .config(['$stateTransitionProvider', function(stp) {
 *      stp
 *       .transition('closed', 'open', {
 *         before: ['$transition', function($transition) {
 *           console.log('We are about to open the door.');
 *         }]
 *       }])
 *    }]);
 * </pre>
 * <br/>
 * ### Targeting Multiple States
 * When defining states when configuring transitions, multiple states can be targeted either using the `*` wildcard or as arrays.
 * #### Using Wildcards
 * 
 * By using `*` one can target all states the the Hierarchy below.
 * <br/>
 * So if we just use `*` we target all existing states under `root`, and we can define a global handler that gets called on all transitions by using `*` both as destination and source.
 * 
 * <pre dx-syntax class="brush: js">
 *  angular.module('demo', ['dotjem.routing'])
 *    .config(['$stateTransitionProvider', function(stp) {
 *      stp
 *        .transition('*', '*', ['$transition', function($transition) { 
 *          console.log('This handler will get called for all transitions'); 
 *        }])
 *    }]);
 * </pre>
 * 
 * We can also target all transitions to or from a specific state that way:
 * 
 * <pre dx-syntax class="brush: js">
 *  angular.module('demo', ['dotjem.routing'])
 *    .config(['$stateTransitionProvider', function(stp) {
 *      stp
 *        .transition('*', 'state', ['$transition', function($transition) { 
 *          console.log('This handler will get called for all'
 *                    + ' transitions to "state"'); 
 *        }])
 *        .transition('state', '*', ['$transition', function($transition) { 
 *          console.log('This handler will get called for all'
 *                    + ' transitions from "state"'); 
 *        }])
 *    }]);
 * </pre>
 * 
 * This was global handlers, but we might also wan't to target any state below a specific state:
 * 
 * <pre dx-syntax class="brush: js">
 *  angular.module('demo', ['dotjem.routing'])
 *    .config(['$stateTransitionProvider', function(stp) {
 *      stp
 *        .transition('*', 'state.*', ['$transition', function($transition) { 
 *          console.log('This handler will get called for all transitions to'
 *                    + ' "state" or any of its descendant states'); 
 *        }])
 *        .transition('state.*', '*', ['$transition', function($transition) { 
 *          console.log('This handler will get called for all transitions from'
 *                    + ' "state" or any of it's descendant states'); 
 *        }])
 *    }]);
 * </pre>
 * 
 * #### Using Arrays
 * 
 * In addition to using the `*` wildcart to target multiple states, it is also possible to use arrays for a more specific match.
 * 
 * <pre dx-syntax class="brush: js">
 *  angular.module('demo', ['dotjem.routing'])
 *    .config(['$stateTransitionProvider', function(stp) {
 *      stp
 *        .transition(['book', 'book.item', 'book.list'],
 *                    'paper', 
 *                    ['$transition', function($transition) { 
 *                      console.log('This handler will get called for transitions from'
 *                                + ' "book", "book.item" and "book.list" to "paper"'); 
 *        })]
 *        .transition('paper',
 *                    ['book', 'book.item', 'book.list'],
 *                    ['$transition', function($transition) { 
 *                      console.log('This handler will get called for transitions to'
 *                                + ' "book", "book.item" and "book.list" from "paper"'); 
 *        }])
 *    }]);
 * </pre>
 * 
 * Each of the states, wildcards can also be used:
 * 
 * <pre dx-syntax class="brush: js">
 *  angular.module('demo', ['dotjem.routing'])
 *    .config(['$stateTransitionProvider', function(stp) {
 *      stp
 *       .transition(['book', 'book.item.*', 'book.list.*'], 
 *                   ['paper', 'pen.*'],
 *                   ['$transition', function($transition) { 
 *                     console.log('Handle all the above, this creates'
 *                               + ' to many combinations to write out'); 
 *       }])
 *    }]);
 * </pre>
 */
function $StateTransitionProvider() {
    'use strict';
    var root = { children: {}, targets: {} },
        //Note: Do not remove
        _this = this;

    function alignHandler(obj) {
        var result: any = { handler: {} };

        if (isDefined(obj.to)) {
            result.to = obj.to;
        }

        if (isDefined(obj.from)) {
            result.from = obj.from;
        }

        if (isDefined(obj.handler)) {
            result.handler = obj.handler;
        }
        
        if (isDefined(obj.before) && isUndefined(result.handler.before)) {
            result.handler.before = obj.before;
        }
        
        if (isDefined(obj.between) && isUndefined(result.handler.between)) {
            result.handler.between = obj.between;
        }
        
        if (isDefined(obj.after) && isUndefined(result.handler.after)) {
            result.handler.after = obj.after;
        }
        
        return result;
    }

    /**
     * @ngdoc method
     * @name dotjem.routing.$stateTransitionProvider#onEnter
     * @methodOf dotjem.routing.$stateTransitionProvider
     *
     * @param {string|State|Array} state The state name matchers(s) to match when entering.
     * @param {funtion|Object} handler The handler to invoke when entering the state.
     * <br/>
     * Either a injectable function or a handler object. If handler is an object, it must define one or more of the
     * following properties:
     * 
     * - `before` `{function}` : handler to be called before transition starts
     * - `between` `{function}` : handler to be called right after views are resolved
     * - `after` `{function}` : handler to be called when transition is complete
     *
     * @description
     * This is a shorthand method for `$stateTransitionProvider.transition('*', state, handler);`
     * <br/>
     * Instead of using this method, the transitions can also be configured when defining states through the {@link dotjem.routing.$stateProvider $stateProvider}.
     */
    this.onEnter = function (state: any, handler) {
        if (isInjectable(handler)) {
            this.transition('*', state, handler);
        } else if (isObject(handler)) {
            var aligned = alignHandler(handler);
            this.transition(aligned.from || '*', state, aligned.handler);
        }
    };

    /**
     * @ngdoc method
     * @name dotjem.routing.$stateTransitionProvider#onExit
     * @methodOf dotjem.routing.$stateTransitionProvider
     *
     * @param {string|State|Array} state The state name matchers(s) to match when leaving.
     * @param {funtion|Object} handler The handler to invoke when entering the state.
     * <br/>
     * Either a injectable function or a handler object. If handler is an object, it must define one or more of the
     * following properties:
     * 
     * - `before` `{function}` : handler to be called before transition starts
     * - `between` `{function}` : handler to be called right after views are resolved
     * - `after` `{function}` : handler to be called when transition is complete
     *
     * @description
     * This is a shorthand method for `$stateTransitionProvider.transition(state, '*', handler);`
     * <br/>
     * Instead of using this method, the transitions can also be configured when defining states through the {@link dotjem.routing.$stateProvider $stateProvider}.
     */
    this.onExit = function (state: any, handler) {
        if (isInjectable(handler)) {
            this.transition(state, '*', handler);
        } else if (isObject(handler)) {
            var aligned = alignHandler(handler);
            this.transition(state, aligned.to || '*', aligned.handler);
        }
    };

    /**
     * @ngdoc method
     * @name dotjem.routing.$stateTransitionProvider#transition
     * @methodOf dotjem.routing.$stateTransitionProvider
     *
     * @param {string|State|Array} from The state name matchers(s) to match on leaving.
     * @param {string|State|Array} to The The state name matchers(s) to match on entering.
     * @param {funtion|Object} handler The handler to invoke when the transitioning occurs.
     * <br/>
     * Either a injectable function or a handler object. If handler is an object, it must define one or more of the
     * following properties:
     * 
     * - `before` `{function}` : handler to be called before transition starts
     * - `between` `{function}` : handler to be called right after views are resolved
     * - `after` `{function}` : handler to be called when transition is complete
     *
     * @description
     * Register a single handler to get called when leaving the state(s) passed as the from parameter
     * to the state(s) passed as the to parameter.
     */
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
            if (to === from && to.indexOf('*') === -1) {
                return this;
            }

            validate(from, to);

            if (isInjectable(handler)) { 
                handler = { between: handler };
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
        var fromValid = StateRules.validateTarget(from), 
            toValid = StateRules.validateTarget(to);

        if (fromValid && toValid) {
            return;
        }

        if (fromValid) {
            throw new Error("Invalid transition - to: '" + to + "'.");
        }

        if (toValid) {
            throw new Error("Invalid transition - from: '" + from + "'.");
        }

        throw new Error("Invalid transition - from: '" + from + "', to: '" + to + "'.");
    }

    function lookup(name: string) {
        var current = root,
            names = name.split('.'),
            //If name contains root explicitly, skip that one
            i = names[0] === rootName ? 1:0;

        for (; i < names.length; i++) {
            if (!(names[i] in current.children)) {
                current.children[names[i]] = { children: {}, targets: {} };
            }
            current = current.children[names[i]];
        }
        return current;
    }

    /**
     * @ngdoc object
     * @name dotjem.routing.$stateTransition
     *
     * @description
     * See {@link dotjem.routing.$stateTransitionProvider $stateTransitionProvider} for details on how to configure transitions.
     */
    this.$get = [<any>'$q', '$inject',
    function ($q: ng.IQService, $inject: dotjem.routing.IInjectService) {
        var $transition: any = {
            root: root,
            find: find,
            to: noop
        };

        function find(from, to) {
            var transitions = findTransitions(toName(from)),
                handlers = extractHandlers(transitions, toName(to));

            function emit(select, tc, trx) {
                var handler;
                forEach(handlers, (handlerObj) => {
                    if (isDefined(handler = select(handlerObj))) {
                        //TODO: Cache handler.
                        $inject.create(handler)({
                            $to: to,
                            $from: from,
                            $transition: tc,
                            $view: trx
                        });
                    }
                });
            }

            return {
                before: function (tc, trx) { emit(h => h.before, tc, trx); },
                between: function (tc, trx) { emit(h => h.between, tc, trx); },
                after: function (tc, trx) { emit(h => h.after, tc, trx); },
            };
        }

        function trimRoot(path: string[]) {
            if (path[0] === rootName) {
                path.splice(0,1);
            }
            return path;
        }

        function compare(one: string, to: string) {
            var left = trimRoot(one.split('.')).reverse(),
                right = trimRoot(to.split('.')).reverse(),
                l,
                r;

            while (true) {
                l = left.pop();
                r = right.pop();

                if (r === '*' || l === '*') {
                    return true;
                }

                if (l !== r) {
                    return false;
                }

                if (!isDefined(l) || !isDefined(r)) {
                    return true;
                }
            }
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
                index = names[0] === rootName ? 1: 0;

            do {
                if ('*' in current.children) {
                    transitions.push(current.children['*']);
                }

                if (names[index] in current.children) {
                    current = current.children[names[index]];
                    transitions.push(current);
                } else {
                    break;
                }
            } while (index++ < names.length);
            return transitions;
        }


        //var current = $q.when(null);

        //function to(args: { state; params; updateroute?; }) {

        //    current.then(function () { });


        //}

        return $transition;
    }];
}
angular.module('dotjem.routing').provider('$stateTransition', $StateTransitionProvider);