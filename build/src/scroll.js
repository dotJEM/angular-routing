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
            function ($window, $rootScope, $location, $anchorScroll, $injector) {
                var document = $window.document;
                function scroll(arg) {
                    var elm = arg, fn, strArg;
                    if(isUndefined(arg)) {
                        $anchorScroll();
                        return;
                    } else if(arg === null) {
                        return;
                    } else if(isString(arg)) {
                        elm = angular.element(arg)[0];
                        /****jQuery( "[attribute='value']"
                        * scrollTo: top - scroll to top, explicitly stated.
                        *           (This also enables one to override another scrollTo from a parent)
                        * scrollTo: null - don't scroll, not even to top.
                        * scrollTo: element-selector - scroll to an element id
                        * scrollTo: ['$stateParams', function($stateParams) { return stateParams.section; }
                        *           - scroll to element with id or view if starts with @
                        */
                                            } else if((fn = injectFn(arg)) !== null) {
                        elm = document.getElementById($injector.invoke(arg, fn));
                    }
                    if(elm) {
                        elm.scrollIntoView();
                    }
                }
                //if (autoscroll) {
                //    $rootScope.$watch(
                //        function () { return $location.hash(); },
                //        function () { $rootScope.$evalAsync(scroll); });
                //}
                return scroll;
            }        ];
    }];
angular.module('ui.routing').provider('$scroll', $ScrollProvider);
