/// <reference path="../refs.d.ts" />

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
* @param {string} loader Url to a template to display while the view is prepared.
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
var jemViewDirective = [
    '$state', '$compile', '$controller', '$view', '$animate', '$template',
    function ($state, $compile, $controller, $view, $animate, $template) {
        'use strict';
        return {
            restrict: 'ECA',
            terminal: true,
            priority: 1000,
            transclude: 'element',
            compile: function (element, attr, linker) {
                return function (scope, element, attr) {
                    var viewScope, viewElement, name = attr.jemView || attr.dxView || attr.name, onloadExp = attr.onload || '', version = -1, loader = (attr.loader && $template(attr.loader)) || null, activeLoader;

                    scope.$on(EVENTS.VIEW_UPDATE, function (event, updatedName) {
                        if (updatedName === name) {
                            update(true);
                        }
                    });

                    scope.$on(EVENTS.VIEW_REFRESH, function (event, refreshName, refreshData) {
                        if (refreshName === name) {
                            if (isFunction(viewScope.refresh)) {
                                viewScope.refresh(refreshData);
                            } else {
                                viewScope.$broadcast('$refresh', refreshName, refreshData);
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
                            loader.then(function (html) {
                                element.contents().hide();
                                element.append(activeLoader = angular.element(html));
                            });
                        }
                    }

                    function cleanupView(doAnimate) {
                        if (viewScope) {
                            viewScope.$destroy();
                            viewScope = null;
                        }

                        if (viewElement) {
                            if (doAnimate) {
                                $animate.leave(viewElement);
                            } else {
                                viewElement.remove();
                            }
                            viewElement = null;
                        }
                    }

                    function update(doAnimate) {
                        var view = $view.get(name), controller;

                        if (view && view.template) {
                            if (view.version === version) {
                                return;
                            }

                            version = view.version;
                            controller = view.controller;

                            view.template.then(function (html) {
                                var newScope = scope.$new();
                                linker(newScope, function (clone) {
                                    cleanupView(doAnimate);

                                    clone.html(html);
                                    if (doAnimate) {
                                        $animate.enter(clone, null, element);
                                    } else {
                                        element.after(clone);
                                    }

                                    var link = $compile(clone.contents()), locals;

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
                };
            }
        };
    }];

angular.module('dotjem.routing').directive('jemView', jemViewDirective);
angular.module('dotjem.routing').directive('dxView', jemViewDirective);
