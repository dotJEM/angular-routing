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
var jemViewDirective = [<any>'$state', '$scroll', '$compile', '$controller', '$view', '$animate',
function ($state, $scroll, $compile, $controller, $view: dotjem.routing.IViewService, $animate) {
    'use strict';
    return {
        restrict: 'ECA',
        terminal: true,
        priority: 1000,
        transclude: 'element',
        compile: function (element: JQuery, attr, linker) {
          return function (scope, $element: JQuery, attr) {
            var currentScope: IViewScope,
                currentElement: JQuery,
                onloadExp = attr.onload || '',
                name = attr.jemView || attr.name,
                version = -1;

            // TODO: IView.controllerAs
            // TODO: IView.scrollTo

            scope.$on('$viewUpdated', function(event, updatedName) {
                if (updatedName === name) update();
            });
            scope.$on('$viewRefresh', function (event, refreshName, refreshData) {
                if (refreshName === name) {
                    if (isFunction(currentScope.refresh)) {
                        currentScope.refresh(refreshData);
                    } else {
                        currentScope.$broadcast('$refresh', refreshName, refreshData)
                    }
                }
            });
            scope.$on('$stateChangeSuccess', update);
            update();

            function cleanupLastView() {
              if (currentScope) {
                currentScope.$destroy();
                currentScope = null;
              }
              if(currentElement) {
                $animate.leave(currentElement);
                currentElement = null;
              }
            }

            function update() {
              var view = $view.get(name);

              if (view && view.template) {
                if (version === view.version)
                  return;

                version = view.version;

                view.template.then(function(template) {
                  var locals = extend({}, view.locals),
                      newScope = scope.$new();
                  linker(newScope, function(clone) {
                    cleanupLastView();

                    clone.html(template);
                    $animate.enter(clone, null, $element);

                    var link = $compile(clone.contents());

                    currentScope = newScope;
                    currentElement = clone;

                    if (view.controller) {
                      locals.$scope = currentScope;
                      var controller = $controller(view.controller, locals);
                      //if (view.controllerAs) {
                      //  currentScope[view.controllerAs] = controller;
                      //}
                      clone.data('$ngControllerController', controller);
                      clone.children().data('$ngControllerController', controller);
                    }

                    link(currentScope);
                    currentScope.$emit('$viewContentLoaded');
                    currentScope.$eval(onloadExp);

                    // $anchorScroll might listen on event...
                    $scroll(/* view.scrollTo? */);
                  });
                });
              } else {
                version = -1;
                cleanupLastView();
              }
            }
          };
        }
    };
}];

angular.module('dotjem.routing').directive('jemView', jemViewDirective);