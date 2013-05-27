/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />
'use strict';
var $ScrollProvider = [
    '$anchorScrollProvider', 
    function ($anchorScrollProvider) {
        var autoscroll = false;
        //TODO: Consider this again... maybe we should just allow for a rerouted disable call?
        // $anchorScrollProvider.disableAutoScrolling();
        this.$get = [
            '$window', 
            '$rootScope', 
            '$location', 
            '$anchorScroll', 
            '$injector', 
            '$timeout', 
            function ($window, $rootScope, $location, $anchorScroll, $injector, $timeout) {
                var document = $window.document;
                function scrollTo(elm) {
                    if(elm) {
                        elm.scrollIntoView();
                    }
                }
                function scroll(arg) {
                    var fn;
                    if(isUndefined(arg)) {
                        $anchorScroll();
                    } else if(isString(arg)) {
                        if(arg === 'top') {
                            $window.scroll(0, 0);
                        } else {
                            scrollTo(angular.element(arg)[0]);
                        }
                        /****jQuery( "[attribute='value']"
                        * scrollTo: top - scroll to top, explicitly stated.
                        *           (This also enables one to override another scrollTo from a parent)
                        * scrollTo: null - don't scroll, not even to top.
                        * scrollTo: element-selector - scroll to an element id
                        * scrollTo: ['$stateParams', function($stateParams) { return stateParams.section; }
                        *           - scroll to element with id or view if starts with @
                        */
                                            } else if((fn = injectFn(arg)) !== null) {
                        scrollTo(angular.element($injector.invoke(arg, fn))[0]);
                    }
                }
                //if (autoscroll) {
                //    $rootScope.$watch(
                //        function () { return $location.hash(); },
                //        function () { $rootScope.$evalAsync(scroll); });
                //}
                return function (arg) {
                    $timeout(function () {
                        scroll(arg);
                    }, 0);
                };
            }        ];
    }];
angular.module('ui.routing').provider('$scroll', $ScrollProvider);
