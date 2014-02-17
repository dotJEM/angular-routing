app.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
        .state('contact', {
            route: '/contact',
            views: {
                sticky: {
                    sticky: 'fixed',
                    template: 'sticky.html',
                    controller: 'stickyController'
                },
                main: {
                    template: 'contact.html',
                    controller: 'contactController'
                },
                footer: { template: function () {
                    return '<h4>Sibling view loaded with '
                        + '<code>contact.html</code> above</h4>';
                }
                },
                'main.contactContent': {
                    template: '<h4>We can also embed a view in another,'
                        + ' this is in <code>{{file}}</code></h4>',
                    controller: ['$scope', function ($scope) {
                        $scope.file = "contact.html";
                        $scope.refresh = function () {
                            $scope.file = "REFRESHED";
                        }
                    }]
                }
            }
        });
}]);