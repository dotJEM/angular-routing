/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
/**
* @ngdoc object
* @name dotjem.routing.$scrollProvider
*
* @description
* Use the `$scrollProvider` to configure scroll behavior of the application.
*/
var $ScrollProvider = [
    function () {
        'use strict';
        /**
        * @ngdoc object
        * @name dotjem.routing.$scroll
        *
        * @description
        * Use the `$scroll` to perform scrolling in the application.
        */
        this.$get = [
            '$window', 
            '$rootScope', 
            '$anchorScroll', 
            '$injector', 
            function ($window, $rootScope, $anchorScroll, $injector) {
                var scroll = function (arg) {
                    var fn;
                    if(isUndefined(arg)) {
                        $anchorScroll();
                    } else if(isString(arg)) {
                        scrollTo(arg);
                    } else if((fn = injectFn(arg)) !== null) {
                        scrollTo(fn($injector));
                    }
                };
                scroll.$current = 'top';
                function scrollTo(elm) {
                    scroll.$current = elm;
                    if(elm === 'top') {
                        $window.scrollTo(0, 0);
                        return;
                    }
                    $rootScope.$broadcast('$scrollPositionChanged', elm);
                }
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
                //    scrollTo: elementid - scroll to an element id
                //scrollTo: ['$stateParams', function($stateParams) { return stateParams.section; } - scroll to element with id or view if starts with @
                return scroll;
            }        ];
    }
];
angular.module('dotjem.routing').provider('$scroll', $ScrollProvider);
