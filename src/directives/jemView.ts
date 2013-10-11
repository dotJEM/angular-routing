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
var jemViewDirective = [<any>'$state', '$scroll', '$compile', '$controller', '$view', '$animator', '$template',
function ($state, $scroll, $compile, $controller, $view: dotjem.routing.IViewService, $animator, $template) {
    'use strict';
    return {
        restrict: 'ECA',
        terminal: true,
        link: function (scope, element: JQuery, attr) {
            var viewScope: IViewScope,
                controller,
                name = attr['jemView'] || attr.name,
                doAnimate = isDefined(attr.ngAnimate),
                onloadExp = attr.onload || '',
                animate = $animator(scope, attr),
                version = -1,
                loader = (attr.loader && $template.get(attr.loader)) || null,
                activeLoader: JQuery;
            //loader = "none | page | view" loader - template = "loader.html"

            scope.$on(EVENTS.VIEW_UPDATE, function (event, updatedName) {
                if (updatedName === name) update(doAnimate);
            });
            scope.$on(EVENTS.VIEW_REFRESH, function (event, refreshName, refreshData) {
                if (refreshName === name) {
                    if (isFunction(viewScope.refresh)) {
                        viewScope.refresh(refreshData);
                    } else {
                        viewScope.$broadcast('$refresh', refreshName, refreshData)
                    }
                }
            });
            scope.$on('$viewPrep', function (event, prepName, data) {
                if (prepName === name && data.type === 'update') {
                    displayLoader();
                } else if (data.type === 'cancel') {
                    removeLoader();
                }
            });

            update(false);

            function removeLoader() {
                if (isDefined(activeLoader)) {
                    activeLoader.remove();
                    activeLoader = undefined;

                    element.contents().show();
                }
            }

            function displayLoader() {
                if (loader !== null) {
                    loader.then((html) => {
                        element.contents().hide();
                        element.append(activeLoader = angular.element(html));
                    });
                }
            }

            function destroyScope() {
                if (viewScope) {
                    viewScope.$destroy();
                    viewScope = null;
                }
            }

            function clearContent(doAnimate) {
                if (doAnimate)
                    animate.leave(element.contents(), element);
                else
                    element.html('');

                destroyScope();
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
                        clearContent(doAnimate);
                        if (doAnimate)
                            animate.enter(angular.element('<div></div>').html(html).contents(), element);
                        else
                            element.html(html);

                        var link = $compile(element.contents()),
                            locals;

                        viewScope = scope.$new();
                        if (controller) {
                            locals = copy(view.locals);
                            locals.$scope = viewScope;
                           
                            controller = $controller(controller, locals);
                            element.contents().data('$ngControllerController', controller);
                        }

                        link(viewScope);

                        viewScope.$emit('$viewContentLoaded');
                        viewScope.$eval(onloadExp);
                    });
                } else {
                    version = -1;
                    clearContent(doAnimate);
                }
            }
        }
    };
}];

angular.module('dotjem.routing').directive('jemView', jemViewDirective);