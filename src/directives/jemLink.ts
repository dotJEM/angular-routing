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
var jemLinkDirective = [<any>'$state', '$route',
function ($state, $route) {
    'use strict';
    return {
        restrict: 'AC',
        link: function (scope, element: JQuery, attrs) {
            var tag = element[0].tagName.toLowerCase(),
                html5 = $route.html5Mode(),
                prefix = $route.hashPrefix(),
                attr = { a: 'href', form: 'action' },
                activeFn = noop;

            if (isDefined(attrs.activeClass))
                activeFn = active;

            function apply() {
                var sref = scope.$eval(attrs.sref),
                    params = scope.$eval(attrs.params),
                    link = $state.url(sref, params);
                //NOTE: Is this correct for forms?
                if (!html5)
                    link = '#' + prefix + link;

                element.attr(attr[tag], link);
            }

            function active() {
                var sref = scope.$eval(attrs.sref);
                if ($state.isActive(sref)) {
                    element.addClass(attrs.activeClass);
                } else {
                    element.removeClass(attrs.activeClass);
                }
            }

            scope.$on(EVENTS.STATE_CHANGE_SUCCESS, activeFn);

            if (tag in attr) {
                attrs.$observe('params', apply);
                attrs.$observe('sref', apply);
            } else {
                element.click(function () {
                    scope.$apply(function () {
                        var sref = scope.$eval(attrs.sref), params = scope.$eval(attrs.params);
                        $state.goto(sref, params);
                    });
                });
            }
        }
    };
}];

angular.module('dotjem.routing').directive('sref', jemLinkDirective);
