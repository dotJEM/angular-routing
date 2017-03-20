/// <reference path="../_references.d.ts" />
angular.module('dotjem.routing.pages').controller('dxSampleController', [
    '$scope', '$attrs', 'plunkr', function ($scope, $attrs, plunkr) {
        var files = [];
        var tags = $.map(($attrs.tags || 'angularjs;angular-routing').split(';'), function (item, index) {
            return item.trim();
        });

        $scope.scrollable = $attrs.scrollable;
        $scope.files = {};
        $scope.edit = function () {
            plunkr(files, tags);
        };
        $scope.show = function (file) {
            $scope.current.elm.hide();
            $scope.current = file;
            $scope.current.elm.show();
        };

        var categories = {
            css: { icon: 'icon-css3', title: 'Styles' },
            js: { icon: 'icon-code', title: 'Scripts' },
            html: { icon: 'icon-html5', title: 'Html' }
        };

        return {
            add: function (fileName, fileType, source, element) {
                var file, cat, list;
                cat = categories[fileType];
                file = {
                    name: fileName,
                    type: fileType,
                    source: source,
                    elm: element
                };

                files.push(file);

                list = $scope.files[fileType] || { files: [], title: cat.title, icon: cat.icon };
                list.files.push(file);
                $scope.files[fileType] = list;

                if (angular.isDefined($scope.current)) {
                    element.hide();
                } else {
                    $scope.current = file;
                }
            }
        };
    }
]);

angular.module('dotjem.routing.pages').directive('dxSample', [
    function () {
        return {
            restrict: 'ECA',
            transclude: true,
            controller: 'dxSampleController',
            templateUrl: '/angular-routing/templates/directives/dxSampleTemplate.html',
            scope: {}
        };
    }
]);

angular.module('dotjem.routing.pages').directive('dxSampleFile', [
    '$http', '$q', '$compile',
    function ($http, $q, $compile) {
        return {
            restrict: 'ECA',
            require: '?^dxSample',
            scope: {},
            link: function (scope, element, attributes, controller) {
                var file = attributes.src, name = attributes.name, type;

                function addFile(fileName, fileType, source) {
                    if (angular.isDefined(controller)) {
                        controller.add(fileName, fileType, source, element);
                    }
                }

                if (angular.isDefined(file)) {
                    name = file.substring(file.lastIndexOf('/') + 1);
                    type = file.substring(file.lastIndexOf('.') + 1);
                    $http.get(file, { cache: true, transformResponse: function (d, h) {
                            return d;
                        } }).then(function (result) {
                        var container = angular.element('</dic><pre dx-syntax class="brush: ' + type + '"></pre>');
                        container.text(result.data);
                        element.append(angular.element('<div></div>').append(container));
                        $compile(element.contents())(scope);

                        addFile(name, type, result.data);
                    }, function (error) {
                        //TODO: Error loading source
                    });
                } else {
                    //TODO: Sample provided directly into the directive.
                    //      Read sample, embed it in a pre, require name and push it to the dxSample if present.
                }
            }
        };
    }
]);
