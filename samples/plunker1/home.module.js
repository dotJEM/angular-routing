angular.module('demo.home', ['dotjem.routing'])
  .config(['$stateProvider', function (sp) {
      sp.state('home', {
          route: '/',
          views: {
              main: {
                  template: 'home.html'
              }
          }
      });
  }]);