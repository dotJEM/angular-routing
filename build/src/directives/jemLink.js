/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../interfaces.d.ts" />
/// <reference path="../common.ts" />
/**
* @ngdoc directive
* @name dotjem.routing.directive:sref
* @restrict AC
*
* @description
* Provides a link to a state.
*
* @element ANY
* @param {string} params Parameters for the state link.
*/
var jemLinkDirective = [
    '$state', 
    '$route', 
    function ($state, $route) {
        'use strict';
        return {
            restrict: 'AC',
            terminal: false,
            scope: {
                sref: '=',
                params: '='
            },
            link: function (scope, element, attr) {
                var tag = element[0].tagName.toLowerCase(), html5 = $route.html5Mode(), prefix = $route.hashPrefix();
                function applyHref(link) {
                    if(!html5) {
                        link = '#' + prefix + link;
                    }
                    element.attr('href', link);
                }
                if(tag === 'a') {
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
