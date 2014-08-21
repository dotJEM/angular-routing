angular.module('demo.contact', ['dotjem.routing'])
  .config(['$stateProvider', function(sp){
    sp.state('contact', {
      route: '/contact',
      views: { 
          main: {  template: 'tpl-contact.html'
        } 
      }
    })
  }]);