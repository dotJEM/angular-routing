/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />

'use strict';
var $ScrollProvider = [<any>'$anchorScrollProvider', function ($anchorScrollProvider: ng.IAnchorScrollProvider) {
    var autoscroll: bool = false;


    //TODO: Consider this again... maybe we should just allow for a rerouted disable call?
    // $anchorScrollProvider.disableAutoScrolling();


    this.$get = [<any>'$window', '$rootScope', '$location', '$anchorScroll', '$injector','$timeout',
        function ($window: ng.IWindowService, $rootScope: ng.IRootScopeService, $location: ng.ILocationService, $anchorScroll: ng.IAnchorScrollService, $injector: ng.auto.IInjectorService, $timeout: ng.ITimeoutService) {
            var document = $window.document;

            function scrollTo(elm: any) {
                if (elm) elm.scrollIntoView();
            }

            function scroll(arg: any) {
                var fn;
                if (isUndefined(arg)) {
                    $anchorScroll();
                } else if (isString(arg)) {
                    if (arg === 'top') {
                        $window.scroll(0, 0);
                    } else {
                        scrollTo(angular.element(arg)[0])
                    }
                    /****jQuery( "[attribute='value']" 
                     * scrollTo: top - scroll to top, explicitly stated.
                     *           (This also enables one to override another scrollTo from a parent)
                     * scrollTo: null - don't scroll, not even to top.
                     * scrollTo: element-selector - scroll to an element id
                     * scrollTo: ['$stateParams', function($stateParams) { return stateParams.section; } 
                     *           - scroll to element with id or view if starts with @
                     */
                } else if ((fn = injectFn(arg)) !== null) {
                    scrollTo(angular.element($injector.invoke(arg, fn))[0])
                }
            }

            //if (autoscroll) {
            //    $rootScope.$watch(
            //        function () { return $location.hash(); },
            //        function () { $rootScope.$evalAsync(scroll); });
            //}
            return function (arg: any) {
                $timeout(function () { scroll(arg); }, 0);
            };
        }];
}];
angular.module('ui.routing').provider('$scroll', $ScrollProvider);