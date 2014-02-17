var app = angular.module('tutorial', ['dotjem.routing']);

app.config(['$stateProvider', function($stateProvider) {
  $stateProvider
    .state('home', {
      route: '/',
      views: {
        main: { template: 'home.html' }
      }
    });
    
  $stateProvider
    .state('about', {
      route: '/about',
      views: {
        main: { template: 'about.html' }
      }
    });
    
  $stateProvider
    .state('contact', {
      route: '/contact',
      views: {
        main: { template: 'contact.html' }
      }
    });
}]);

app.controller('siteController', ['$scope', '$state', 
  function($scope, $state){
    $scope.isActive = $state.isActive;
  }])