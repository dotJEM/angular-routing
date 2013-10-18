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
                var tag = element[0].tagName.toLowerCase(), html5 = $route.html5Mode(), prefix = $route.hashPrefix(), attr = {
                    a: 'href',
                    form: 'action'
                };
                function apply(link) {
                    //NOTE: Is this correct for forms?
                    if(!html5) {
                        link = '#' + prefix + link;
                    }
                    element.attr(attr[tag], link);
                }
                if(tag in attr) {
                    scope.$watch('[sref,params]', function () {
                        apply($state.url(scope.sref, scope.params));
                    });
                    apply($state.url(scope.sref, scope.params));
                } else {
                    element.click(function (event) {
                        $state.goto(scope.sref, scope.params);
                    });
                }
            }
        };
    }];
angular.module('dotjem.routing').directive('sref', jemLinkDirective);
