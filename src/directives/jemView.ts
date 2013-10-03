/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../interfaces.d.ts" />
/// <reference path="../common.ts" />

interface IViewScope extends ng.IScope {
    refresh?: (data?: any) => void;
}

/**
 * @ngdoc directive
 * @name dotjem.routing.directive:jemView
 * @restrict ECA
 *
 * @description
 * # Overview
 * `jemView` is a directive that complements the {@link dotjem.routing.$state $state} service by
 * including the rendered template of the current state into the main layout (`index.html`) file.
 * Every time the current route changes, the included view changes with it according to the
 * configuration of the `$state` service.
 *
 * # animations
 * - enter - animation is used to bring new content into the browser.
 * - leave - animation is used to animate existing content away.
 *
 * The enter and leave animation occur concurrently.
 *
 * @param {string} jemView|name Name of the view
 */

/**
 * @ngdoc event
 * @name dotjem.routing.directive:jemView#$viewContentLoaded
 * @eventOf dotjem.routing.directive:jemView
 *
 * @eventType emit on the current jemView scope
 *
 * @description
 * Emitted every time the jemView content is reloaded.
 */

/**
 * @ngdoc event
 * @name dotjem.routing.directive:jemView#$refresh
 * @eventOf dotjem.routing.directive:jemView
 *
 * @eventType broadcast on the current jemView scope
 *
 * @description
 * This event is broadcasted on the view scope unless the view scope defines a refresh function.
 * <br/>
 * Refresh happens for sticky views when the sticky flag remains the same during an update.
 *
 * @param {Object} angularEvent Synthetic event object.
 * @param {string} name The name of the view where the broadcast originated.
 * @param {Object} name Any data that may have been provided for a refresh.
 */
var jemViewDirective = [<any>'$state', '$compile', '$controller', '$view', '$animate',
function ($state, $compile, $controller, $view: dotjem.routing.IViewService, $animate) {
    'use strict';
    return {
        restrict: 'ECA',
        terminal: true,
        priority: 1000,
        transclude: 'element',
        compile: function(element: JQuery, attr, linker) {
            return function (scope, element: JQuery, attr) {
                var viewScope: IViewScope,
                    viewElement: JQuery,
                    name = attr['jemView'] || attr.name,
                    onloadExp = attr.onload || '',
                    version = -1;

                scope.$on('$viewUpdated', function(event, updatedName) {
                    if (updatedName === name) update(true);
                });
                scope.$on('$viewRefresh', function (event, refreshName, refreshData) {
                    if (refreshName === name) {
                        if (isFunction(viewScope.refresh)) {
                            viewScope.refresh(refreshData);
                        } else {
                            viewScope.$broadcast('$refresh', refreshName, refreshData)
                        }
                    }
                });
                scope.$on('$stateChangeSuccess', () => update(true));
                scope.$on('$stateChangeStart', () => progress(true, false));
                scope.$on('$stateChangeAborted', () => progress(true, true));

                update(false);

                function progress(doAnimate, cancel) {

                }

                function cleanupView(doAnimate) {
                    if (viewScope) {
                        viewScope.$destroy();
                        viewScope = null;
                    }

                    if (viewElement) {
                        if (doAnimate)
                            $animate.leave(viewElement);
                        else
                            viewElement.remove();
                        viewElement = null;
                    }
                }

                function update(doAnimate) {
                    var view = $view.get(name),
                        controller;

                    if (view && view.template) {
                        if (view.version === version)
                            return;

                        version = view.version;
                        controller = view.controller;

                        view.template.then((html) => {
                            var newScope = scope.$new();
                            linker(newScope, function(clone) {
                                cleanupView(doAnimate);

                                clone.html(html);
                                if (doAnimate)
                                    $animate.enter(clone, null, element);
                                else
                                    element.after(clone);

                                var link = $compile(clone.contents()),
                                    locals;

                                viewScope = newScope;
                                viewElement = clone;

                                if (controller) {
                                    locals = extend({}, view.locals);
                                    locals.$scope = viewScope;

                                    controller = $controller(controller, locals);
                                    clone.data('$ngControllerController', controller);
                                    clone.children().data('$ngControllerController', controller);
                                }

                                link(viewScope);

                                viewScope.$emit('$viewContentLoaded');
                                viewScope.$eval(onloadExp);
                            });
                        });
                    } else {
                        version = -1;
                        cleanupView(doAnimate);
                    }
                }
            }
        }
    };
}];

angular.module('dotjem.routing').directive('jemView', jemViewDirective);