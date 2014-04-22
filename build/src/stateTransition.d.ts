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
declare function $StateTransitionProvider(): void;
