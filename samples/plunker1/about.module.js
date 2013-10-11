angular.module('demo.about', ['dotjem.routing'])
  .config(['$stateProvider', function(sp){
    sp.state('about', {
      route: '/about',
      resolve: {
        item: function($timeout) {
          return $timeout(function() {
            return 42;
          }, 500);
        }
      },
      views: { 
        main: {  
          template: 'about.html',
          controller: function($scope, item){
            $scope.model = { av: item };
          }
        } 
      }
    });
    
    sp.state('about.one', {
      route: '/one',
      resolve: {
        a: function($timeout, $q, item) {
          return $timeout(function() {
            return item / 2;
          }, 500);
        }
      },
      views: { 
        about: {  
          template: {
              html: '<h1>ONE</h1>Result: {{ model.ova }}'
                   +'<br/>Inherited Item: {{ model.ovi }}'
                   +'<br/>Item from old: {{ model.av }}' },
          controller: function($scope, item, a){
            $scope.model.ovi = item;
            $scope.model.ova = a;
          }
        } 
      }
    });
    
    sp.state('about.two', {
      route: '/two',
      resolve: {
        b: function($timeout, $q, item) {
          return $timeout(function() {
            return 100 * item;
          }, 500);
        }
      },
      views: { 
        about: {  
          template: {  
              html: '<h1>TWO</h1>Result: {{ model.tvb }}'
                   +'<br/>Inherited Item: {{ model.tvi }}'
                   +'<br/>Item from old: {{ model.av }}' },
          controller: function($scope, item, b){
            $scope.model.tvi = item;
            $scope.model.tvb = b;
          }
        } 
      }
    });
    
    sp.state('about.three', {
      route: '/three',
      resolve: {
        b: function($timeout, $q, item) {
          return $timeout(function() {
            return item * item;
          }, 500);
        }
      },
      views: { 
        about: {  
          template: {  
              html: '<h1>THREE</h1>Result: {{ model.tvb }}'
                   +'<br/>Inherited Item: {{ model.tvi }}'
                   +'<br/>Item from old: {{ model.av }}' },
          controller: function($scope, item, b){
            $scope.model.tvi = item;
            $scope.model.tvb = b;
          }
        } 
      }
    });
    
  }]);