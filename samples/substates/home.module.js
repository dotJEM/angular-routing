angular.module('demo.home', ['dotjem.routing'])
  .config(['$stateProvider', function(sp){
    sp.state('home', {
      route: '/',
      views: { 
          main: {  template: 'tpl-home.html'
        } 
      }
    });
    
    sp.state('home.default', {
      route: '/', 
      views: { 
          home: {  template: 'tpl-home-default.html'
        } 
      }
    });
    
    sp.state('home.page1', {
      route: '/page1',
      views: { 
          home: {  template: 'tpl-home-page1.html'
        } 
      }
    });
    
    sp.state('home.page2', {
      route: '/page2',
      views: { 
          home: {  template: 'tpl-home-page2.html'
        } 
      }
    });
    
  }]);