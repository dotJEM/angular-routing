/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../interfaces.d.ts" />
/// <reference path="../common.ts" />
'use strict';
var uiViewDirective = [
    '$state', 
    '$anchorScroll', 
    '$compile', 
    '$controller', 
    '$view', 
    function ($state, $anchorScroll, $compile, $controller, $view) {
        return {
            restrict: 'ECA',
            terminal: true,
            link: function (scope, element, attr) {
                var viewScope, name = attr['uiView'] || attr.name, onloadExp = attr.onload || '', version = -1;
                scope.$on('$viewChanged', function (event, updatedName) {
                    if(updatedName === name) {
                        update();
                    }
                });
                scope.$on('$stateChangeSuccess', update);
                update();
                function resetScope(newScope) {
                    if(viewScope) {
                        viewScope.$destroy();
                    }
                    viewScope = newScope === 'undefined' ? null : newScope;
                }
                function update() {
                    var view = $view.get(name), controller;
                    if(view && view.template) {
                        if(view.version === version) {
                            return;
                        }
                        version = view.version;
                        controller = view.controller;
                        view.template.then(function (html) {
                            element.hide();
                            element.html(html);
                            resetScope(scope.$new());
                            var link = $compile(element.contents());
                            if(controller) {
                                controller = $controller(controller, {
                                    $scope: viewScope
                                });
                                element.contents().data('$ngControllerController', controller);
                            }
                            link(viewScope);
                            viewScope.$emit('$viewContentLoaded');
                            viewScope.$eval(onloadExp);
                            element.slideDown();
                            $anchorScroll();
                        });
                    } else {
                        element.html('');
                        resetScope();
                    }
                }
            }
        };
    }];
angular.module('ui.routing').directive('uiView', uiViewDirective);
