app.config(['$stateProvider', function($stateProvider) {
    $stateProvider
        .state('home', {
            route: '/',
            views: {
                main: { template: 'home.html' }
            }
        });
}]);
