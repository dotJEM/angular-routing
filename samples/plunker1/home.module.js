angular.module('demo.home', ['dotjem.routing'])
  .config(['$stateProvider', function(sp){
    sp.state('home', {
      route: '/',
      views: { 
          main: { 
            template: 'home.html',
            controller: 'homeCtrl',
            sticky: true
          } 
      }
    })

  }]);
  
angular.module('demo.home')
  .controller('homeCtrl', function( $scope, $state ) {

    $scope.tabs1 = { current: 'default', templates: {} };
    $scope.tabs2 = { current: 'default', templates: {} };
    $scope.model = { inst: 0 };
  
    $scope.refresh = refresh;
    
    function refresh() {
      var tab1 = $state.params.activeTab || $scope.tabs1.current;
      var tab2 = $state.params.activeTab2 || $scope.tabs2.current;
      
      $scope.tabs1.current = tab1;
      $scope.tabs2.current = tab2;
      
      $scope.tabs1.templates[tab1] = 'tab.'+tab1+'.html';
      $scope.tabs2.templates[tab2] = 'tab.'+tab2+'.html';
    }
    refresh();
    
  });

angular.module('demo.home')
  .controller('defaultTabCtrl', function($scope) {
    $scope.model.inst++;
  })

angular.module('demo.home')
  .controller('profileTabCtrl', function($scope) {
    $scope.model.inst++;
  })
  
angular.module('demo.home')
  .controller('messagesTabCtrl', function($scope) {
    $scope.model.inst++;
  })
