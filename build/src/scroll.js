/// <reference path="refs.d.ts" />
var $ScrollProvider = [function () {
        'use strict';

        /**
        * @ngdoc function
        * @name dotjem.routing.$scroll
        *
        * @requires $window
        * @requires $rootScope
        * @requires $anchorScroll
        * @requires $injector
        *
        * @param {string|function=} target The element name to scroll to or a function returning it.
        *
        * @description
        * The `$scroll` service offers a number of enhancements over the current `@anchorScroll` and serves for a direct replacement.
        *
        * When called with no parameter like `$scroll()` the call is re-routed to `$anchorScroll` otherwise `$scroll` performs the scrolling.
        *
        * Scrolling to named elements is dependant on the `jemAnchor` directive which will register elements to be targets for the `$scroll` service. This is
        * to allow elements that is being loaded as part of a transition to also work as targets after `$scroll` has been called.
        */
        this.$get = [
            '$window', '$rootScope', '$anchorScroll', '$inject',
            function ($window, $rootScope, $anchorScroll, $inject) {
                var scroll = function (arg) {
                    var ifn;
                    if (isUndefined(arg)) {
                        $anchorScroll();
                    } else if (isString(arg)) {
                        scrollTo(arg);
                    } else if (ifn = $inject.create(arg)) {
                        scrollTo(ifn());
                    }
                };

                scroll.$current = 'top';

                function scrollTo(elm) {
                    scroll.$current = elm;
                    if (elm === 'top') {
                        $window.scrollTo(0, 0);
                        return;
                    }
                    $rootScope.$broadcast('$scrollPositionChanged', elm);
                }

                //TODO: could we support mocking this way if it doesn't work out of the box?
                //scroll.$fn = scroll;
                return scroll;
            }];
    }];
angular.module('dotjem.routing').provider('$scroll', $ScrollProvider);
//scroll.$register = register;
//var elements = {};
//function register(name: string, elm: HTMLElement) {
//    if (name in elements) {
//        var existing = elements[name];
//    }
//    elements[name] = elm;
//}
/****jQuery( "[attribute='value']"
* scrollTo: top - scroll to top, explicitly stated.
*           (This also enables one to override another scrollTo from a parent)
* scrollTo: null - don't scroll, not even to top.
* scrollTo: element-selector - scroll to an element id
* scrollTo: ['$stateParams', function($stateParams) { return stateParams.section; }
*           - scroll to element with id or view if starts with @
*/
//scrollTo: top - scroll to top, explicitly stated.(This also enables one to override another scrollTo from a parent)
//scrollTo: null - don't scroll, not even to top.
//scrollTo: @viewname - scroll to a view.
//scrollTo: elementid - scroll to an element id
//scrollTo: ['$stateParams', function($stateParams) { return stateParams.section; } - scroll to element with id or view if starts with @
