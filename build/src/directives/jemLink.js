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
* @param {string} activeClass Class to add when the state targeted is active.
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
                params: '=',
                activeClass: '@'
            },
            link: function (scope, element, attrs) {
                var tag = element[0].tagName.toLowerCase(), html5 = $route.html5Mode(), prefix = $route.hashPrefix(), attr = {
                    a: 'href',
                    form: 'action'
                }, activeFn = noop;
                if(isDefined(scope.activeClass)) {
                    activeFn = active;
                }
                function apply() {
                    var link = $state.url(scope.sref, scope.params);
                    //NOTE: Is this correct for forms?
                    if(!html5) {
                        link = '#' + prefix + link;
                    }
                    element.attr(attr[tag], link);
                }
                function active() {
                    if(!isDefined(scope.activeClass)) {
                        return;
                    }
                    if($state.isActive(scope.sref)) {
                        attrs.$addClass(scope.activeClass);
                    } else {
                        attrs.$remove(scope.activeClass);
                    }
                }
                scope.$on(EVENTS.STATE_CHANGE_SUCCESS, activeFn);
                if(tag in attr) {
                    scope.$watch('params', apply);
                    scope.$watch('sref', apply);
                    apply();
                    activeFn();
                } else {
                    element.click(function (event) {
                        $state.goto(scope.sref, scope.params);
                    });
                }
            }
        };
    }];
angular.module('dotjem.routing').directive('sref', jemLinkDirective);
