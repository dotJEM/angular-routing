app.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
        .state('about', {
            route: '/about',
            views: {
                sticky: {
                    sticky: 'fixed',
                    template: 'sticky.html',
                    controller: 'stickyController'
                },
                main: {
                    template: 'about.html',
                    controller: 'aboutController'
                },
                footer: { template: function () {
                    return '<h4>Sibling view loaded with '
                        + '<code>about.html</code> above</h4>';
                }
                },
                'main.aboutContent': {
                    template: '<h4>We can also embed a view in another,'
                        + ' this is in <code>{{file}}</code></h4>',
                    controller: ['$scope', function ($scope) {
                        $scope.file = "about.html";
                        $scope.refresh = function () {
                            $scope.file = "REFRESHED";
                        }
                    }]
                }
            }
        });
}]);