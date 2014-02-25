var app = angular.module('demo', ['dotjem.routing']);

app
  .config(['$stateProvider', function($stateProvider){
    $stateProvider
      .state('about', {
        route: '/about',
        views: { main: { template: 'about.html' } }
      })
      .state('contact', {
        route: '/contact',
        views: { main: { template: 'contact.html' } }
      })
      .state('home', {
        route: '/',
        views: { main: { template: 'home.html' } }
      })
  }]);

app.controller('siteController', ['$scope', '$state',
  function($scope, $state) {
    $scope.fn = { isActive: $state.isActive }
  }]);