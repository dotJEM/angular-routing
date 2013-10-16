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
 * Provides an anchor point for the {@link dotjem.routing.$scroll $scroll} service to use.
 *
 * @element ANY
 * @param {string} jemAnchor|id Identifier of the anchor
 */
var jemLinkDirective = [<any>'$state', '$route', 
function ($state, $route) {
    return {
        restrict: 'A',
        terminal: false,
        scope: {
            sref: '=',
            params: '='
        },
        link: function (scope, element: JQuery, attr) {
            var tag = element[0].tagName.toLowerCase(),
                html5 = $route.html5Mode(),
                prefix = $route.hashPrefix();

            function applyHref(link: string) {
                if (!html5)
                    link = '#' + prefix + link;

                element.attr('href', link);
            }

            if (tag === 'a') {
                scope.$watch('sref', function () {
                    applyHref($state.url(scope.sref, scope.params));
                });
                scope.$watch('params', function () {
                    applyHref($state.url(scope.sref, scope.params));
                });
                applyHref($state.url(scope.sref, scope.params));
            } else {
                element.click(function (event) {
                    $state.goto(scope.sref, scope.params);
                });
            }
        }
    };
}];

angular.module('dotjem.routing').directive('sref', jemLinkDirective);
