var app = angular.module('demo', [
  'demo.home','demo.about','demo.contact',
  'dotjem.routing']);


app.controller('siteController', ['$scope', '$state',
  function($scope, $state) {
    $scope.fn = {
      isActive: $state.isActive
    };
    

    
  }]);