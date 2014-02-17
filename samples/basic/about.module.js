angular.module('demo.about', ['dotjem.routing'])
  .config(['$stateProvider', function(sp){
    sp.state('about', {
      route: '/about',
      views: { 
          main: {  template: 'about.html'
        } 
      }
    })
  }]);