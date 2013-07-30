/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../interfaces.d.ts" />
/// <reference path="../common.ts" />

'use strict';

/**
 * @ngdoc directive
 * @name dotjem.routing.directive:jemAnchor
 * @restrict ECA
 * 
 * @description
 *
 * @element ANY
 * @param {string} jemAnchor Identifier of the anchor
 *
 * @scope
 * @example
    <example module="ngViewExample" deps="angular-route.js" animations="true">
 */
var jemAnchorDirective = [<any>'$scroll', '$timeout',
function ($scroll, $timeout: ng.ITimeoutService) {
    return {
        restrict: 'ECA',
        terminal: false,
        link: function (scope, element: JQuery, attr) {
            var name = attr['jemAnchor'] || attr.id;

            //$scroll.$register(name, element);

            //TODO: This is not aware if there are multiple elements named the same, we should instead
            //      register the element with the $scroll service so that can throw an error if multiple
            //      elements has the same name.
            scope.$on('$scrollPositionChanged', (event, target) => {
                scroll(target);
            });
            scroll($scroll.$current);

            function scroll(target: any) {
                if (target === name) {
                    //Note: Delay scroll untill any digest is done.
                    $timeout(() => {
                        element[0].scrollIntoView();
                    }, 100);
                }
            }
        }
    };
}];

angular.module('dotjem.routing').directive('jemAnchor', jemAnchorDirective);