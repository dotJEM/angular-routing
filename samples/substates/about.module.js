angular.module('demo.about', ['dotjem.routing'])
  .config(['$stateProvider',
    function(sp) {
      sp.state('about', {
        route: '/about',
        views: {
          main: {
            template: 'tpl-about.html'
          }
        }
      });

      sp.state('about.page1', {
        route: '/page1',
        views: {
          about: {
            template: 'tpl-about-page1.html'
          }
        }
      });

      sp.state('about.page2', {
        route: '/page2',
        views: {
          about: {
            template: 'tpl-about-page2.html'
          }
        }
      });

      sp.state('about.page3', {
        route: '/page3',
        views: {
          about: {
            template: 'tpl-about-page3.html'
          }
        }
      });
    }
  ]);