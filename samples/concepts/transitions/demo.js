var app = angular.module('demo', ['dotjem.routing', 'ngAnimate']);

app.config(['$stateProvider', function($stateProvider){
    $stateProvider
        .state('A', {
            route: '/a',
            views: {
                main: {
                    template: '<h1>A</h1><div class="view-container"><div class="view" jem-view="sub"></div></div>'
                }
            }
        })
        .state('A.A', {
            route: '/a', views: { sub: { template: '<h1>A</h1>' } }
        })
        .state('A.B', {
            route: '/b', views: { sub: { template: '<h1>B</h1>' } }
        })
        .state('A.C', {
            route: '/c', views: { sub: { template: '<h1>C</h1>' } }
        })
        .state('B', {
            route: '/b',
            views: { main: { template: '<h1>B</h1><div class="view-container"><div class="view" jem-view="sub"></div></div>' } }
        })
        .state('B.A', {
            route: '/a', views: { sub: { template: '<h1>A</h1>' } }
        })
        .state('B.B', {
            route: '/b', views: { sub: { template: '<h1>B</h1>' } }
        })
        .state('B.C', {
            route: '/c', views: { sub: { template: '<h1>C</h1>' } }
        })
        .state('C', {
            route: '/c',
            views: { main: { template: '<h1>C</h1><div class="view-container"><div class="view" jem-view="sub"></div></div>' } }
        })
        .state('C.A', {
            route: '/a', views: { sub: { template: '<h1>A</h1>' } }
        })
        .state('C.B', {
            route: '/b', views: { sub: { template: '<h1>B</h1>' } }
        })
        .state('C.C', {
            route: '/c', views: { sub: { template: '<h1>C</h1>' } }
        })
}]);

app.controller('siteController', ['$scope', '$state',
    function($scope, $state) {
        var currentNode = null;
        $scope.state = $state;
        $scope.isActive = $state.isActive;
        $scope.$on('$stateChangeSuccess', function(){
            var state = $state.current.$fullname;
            state = state.substring(state.indexOf('.')+1);
            console.info(state);

            if(currentNode !== null){
                currentNode.color = "#DDD";
                currentNode.circle.attr("fill", "#DDD");
            }
            currentNode = find(state, root);
            currentNode.circle.attr("fill", "#0F0");
            currentNode.color = "#0F0";
        })


        var paper = Raphael("canvas", 500, 300);
        var root = {
            x: 250, y: 50, name: 'root', state: '$root',
            nodes: [
                { x: 100, y: 150, name: 'A', state: 'A',
                    nodes: [
                        { x: 50, y:250, name: 'A', state: 'A.A' },
                        { x: 100, y:250, name: 'B', state: 'A.B' },
                        { x: 150, y:250, name: 'C', state: 'A.C' }
                    ]
                },
                { x: 250, y: 150, name: 'B', state: 'B',
                    nodes: [
                        { x: 200, y:250, name: 'A', state: 'B.A' },
                        { x: 250, y:250, name: 'B', state: 'B.B' },
                        { x: 300, y:250, name: 'C', state: 'B.C' }
                    ]
                },
                { x: 400, y: 150, name: 'C', state: 'C',
                    nodes: [
                        { x: 350, y:250, name: 'A', state: 'C.A' },
                        { x: 400, y:250, name: 'B', state: 'C.B' },
                        { x: 450, y:250, name: 'C', state: 'C.C' }
                    ]
                }
            ]
        }

        function find(name, node){
            var r = null;
            if(node.state == name){
                r = node;
            } else {
                angular.forEach(node.nodes, function(n, i){
                    if(r == null){
                        r = find(name, n);
                    }
                });
            }
            return r;
        }


        function drawLine(from, to){
            //paper.
            paper.path("M"+from.x+","+from.y+"L"+to.x+","+to.y+"");
        }
        function drawCircle(node){
            var circle = paper
                .circle(node.x,node.y,20)
                .attr("fill", "#DDD")
                .hover(function(){ circle.attr("fill", "#FF0"); },
                function(){ circle.attr("fill", node.color || "#DDD"); })
                .click(function(){ if(node !== root) { $state.goto(node.state); } });
            node.circle = circle;
            paper
                .text(node.x,node.y,node.name)
                .hover(function(){ circle.attr("fill", "#FF0"); },
                function(){ circle.attr("fill", node.color || "#DDD"); })
                .click(function(){ if(node !== root) { $state.goto(node.state); } });

        }
        function drawTree(node){

            angular.forEach(node.nodes, function(n, i){
                drawLine(node, n);
                drawTree(n);
            })
            drawCircle(node);
        }
        drawTree(root);

    }]);
  
