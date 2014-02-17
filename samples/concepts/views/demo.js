var app = angular.module('demo', ['dotjem.routing']);

app.config(['$stateProvider', function ($stateProvider) {
$stateProvider
    .state('home', {
        route: '/',
        views: {
            sticky: {
                sticky: 'fixed',
                template: 'sticky.html',
                controller: 'stickyController'
            },
            main: { template: 'home.html', controller: 'homeController' },
            footer: { template: function () {
                return '<h4>Sibling view loaded with '
                    + '<code>home.html</code> above</h4>';
            }
            },
            'main.homeContent': {
                template: '<h4>We can also embed a view in another,'
                    + ' this is in <code>{{file}}</code></h4>',
                controller: ['$scope', function ($scope) {
                    $scope.file = "home.html";
                    $scope.refresh = function () {
                        $scope.file = "REFRESHED";
                    }
                }]
            }
        }
    })
}]);