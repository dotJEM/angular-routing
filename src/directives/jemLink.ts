/// <reference path="../refs.d.ts" />

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
                    activeFn = isDefined(attrs.activeClass) ? active : noop;

                function apply(sref, params) {
                    var link = $state.url(sref, params);
                    //NOTE: Is this correct for forms?
                    if (!html5) {
                        link = '#' + prefix + link;
                    }
                    element.attr(attr[tag], link);
                }

                //TODO: Should we depricate this and use filters instead from 0.7.0?
                function active(sref, params) {
                    if ($state.isActive(sref, params)) {
                        element.addClass(attrs.activeClass);
                    } else {
                        element.removeClass(attrs.activeClass);
                    }
                }

                function onClick() {
                    scope.$apply(function () {
                        var sref = scope.$eval(attrs.sref),
                            params = scope.$eval(attrs.params);
                        $state.goto(sref, params);
                    });
                };

                function update() {
                    var sref = scope.$eval(attrs.sref),
                        params = scope.$eval(attrs.params);

                    activeFn(sref, params);
                    apply(sref, params);
                }

                var deregistration = scope.$on(EVENTS.STATE_CHANGE_SUCCESS, update);
                update();

                if (tag in attr) {
                    if (isDefined(attrs.params)) {
                        scope.$watch(attrs.params, update, true);
                    }
                    //NOTE: Should we also use watch for sref, it seems rather unlikely that we should be interested in that.
                    attrs.$observe('sref', apply);
                } else {
                    element.bind('click', onClick);
                }

                scope.$on('$destroy', function () {
                    element.unbind('click', onClick);
                    deregistration();
                });
            }
        };
    }];

angular.module('dotjem.routing').directive('sref', jemLinkDirective);
