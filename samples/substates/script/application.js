var app = angular.module('sample', ['ui.bootstrap', 'ui.routing', 'ui.tree']);app.config(['$stateProvider', '$routeProvider',       function ($stateProvider, $routeProvider) {
           $routeProvider               .otherwise({ redirectTo: '/' });
           
           $stateProvider
                .state('home', {
                    route: '/',
                    views: {
                        'main': {
                            template: 'tpl/home.html',
                            controller: function($rootScope) { $rootScope.page = "home"; }
                        },
                        'crumbs': {
                            template: 'tpl/crumbs.html',
                            controller: function($scope) {
                                $scope.crumbs = [
                                    { link: '#/', title: 'home' }
                                ];
                            }
                        }
                    }
                })
                .state('blog', {
                    route: '/blog',
                    resolve: {
                        rarg1: function ($timeout) {
                            return $timeout(function () {
                                return 42;
                            }, 300);
                        }
                    },
                    views: {
                        'main': {
                            template: 'tpl/blog.html',
                            controller: 'blogController'
                        }
                    }
                })
                .state('blog.default', {
                    route: '',
                    views: {
                        'crumbs': {
                            template: 'tpl/crumbs.html',
                            controller: function ($scope) {
                                $scope.crumbs = [
                                    { link: '#/blog', title: 'blog' }
                                ];
                            }
                        },
                        'content': {
                            template: 'tpl/blog.list.html',
                            controller: function ($scope, blog) {
                                $scope.title = "Recent Posts";
                                $scope.posts = blog.getRecentPosts();
                            }
                        }
                    }
                })
                .state('blog.category', {
                    route: '/category/{category}',
                    resolve: {
                        rarg2: function ($timeout) {
                            return $timeout(function () {
                                return " ponies";
                            }, 300);
                        }
                    },
                    views: {
                        'crumbs': {
                            template: 'tpl/crumbs.html',
                            controller: function($scope, $routeParams) {
                                $scope.crumbs = [
                                    { link: '#/blog', title: 'blog' },
                                    { link: '#/blog/category/' + $routeParams.category, title: "Category: " + $routeParams.category }
                                ];
                            }
                        },
                        'content': {
                            template: 'tpl/blog.list.html',
                            controller: function($scope, $routeParams, blog, rarg1, rarg2) {
                                $scope.title = $routeParams.category;
                                $scope.posts = blog.getPostsByCategory($routeParams.category);
                                $scope.resolved = rarg1 + rarg2;
                            }
                        }
                    }
                })
                .state('blog.archive', {
                    route: '/archive/{archive}',
                    views: {
                        'crumbs': {
                            template: 'tpl/crumbs.html',
                            controller: function($scope, $routeParams) {
                                $scope.crumbs = [
                                    { link: '#/blog', title: 'blog' },
                                    { link: '#/blog/archive/' + $routeParams.archive, title: "Archive: " + $routeParams.archive }
                                ];
                            }
                        },
                        'content': {
                            template: 'tpl/blog.list.html',
                            controller: function($scope, $routeParams, blog) {
                                $scope.title = $routeParams.archive;
                                $scope.posts = blog.getPostsByArchive($routeParams.archive);
                            }
                        }
                    }
                })
                .state('blog.post', {
                    route: '/post/{post}',
                    views: {
                        'crumbs': {
                            template: 'tpl/crumbs.html',
                            controller: function($scope, $routeParams) {
                                $scope.crumbs = [
                                    { link: '#/blog', title: 'blog' },
                                    { link: '#/blog/post/' + $routeParams.post, title: "Post: " + $routeParams.post }
                                ];
                            }
                        },
                        'content': {
                            template: 'tpl/blog.post.html',
                            controller: function($scope, $routeParams, blog) {
                                printStack("Running controller for content");
                                var post = blog.getPost($routeParams.post);
                                $scope.post = post;
                            }
                        }
                    }
                })
                .state('blog.post.top', {
                    route: ''
                })
                .state('blog.post.comments', {
                    route: '/comments',
                    scrollTo: 'comments',
                    views: {
                        'crumbs': {
                            template: 'tpl/crumbs.html',
                            controller: function($scope, $routeParams) {
                                $scope.crumbs = [
                                    { link: '#/blog', title: 'blog' },
                                    { link: '#/blog/post/' + $routeParams.post, title: $routeParams.post }
                                ];
                            }
                        },
                    }
                })
                .state('about', {
                    route: '/about',
                    views: {
                        'main': {
                            template: 'tpl/about.html',
                            controller: function($rootScope) { $rootScope.page = "about"; }
                        },
                        'crumbs': {
                            template: 'tpl/crumbs.html',
                            controller: function($scope) {
                                $scope.crumbs = [
                                    { link: '#/about', title: 'about' }
                                ];
                            }
                        },
                    }
                });
       }]);

app.controller('blogController', function($rootScope, $scope, blog) {
    $rootScope.page = "blog";
    $scope.categories = blog.getCategories();
    $scope.archives = blog.getArchives();
});

app.animation('wave-enter', function ($rootScope, $timeout) {
    return {
        setup: function (element) {
            var elm = $(element);
            var parent = elm.parent();
            elm.addClass('wave-enter-setup');
            parent.css({ 'height': elm.height() });
            parent.addClass('stage');

            return $rootScope.$watch(function () {
                parent.css({ 'height': elm.height() });
            });

        },
        start: function (element, done, memo) {
            var elm = $(element);
            var parent = elm.parent();
            elm.addClass('wave-enter-start');

            $timeout(function () {
                memo();

                elm.removeClass('wave-enter-setup');
                elm.removeClass('wave-enter-start');

                parent.removeClass('stage');
                parent.css('height', null);

                done();
            }, 2000);
        }
    };
});

app.animation('wave-leave', function ($rootScope, $timeout) {
    return {
        setup: function (element) {

            $(element).addClass('wave-leave-setup');
        },
        start: function (element, done, memo) {
            $(element).addClass('wave-leave-start');
            $timeout(function () {
                $(element).removeClass('wave-leave-setup');
                $(element).removeClass('wave-leave-start');
                done();
            }, 2000);
        }
    };
});

function clean(state) {
    var newState = {};
    newState.self = state.self;    newState.fullname = state.fullname;    newState.$name = state.fullname;    newState.children = [];    if (state.route)        newState.route = state.route;
    angular.forEach(state.children, function (child, name) {
        var c = clean(child);
        c.$name = name;
        newState.children.push(c);
    });    return newState;
}
function PageController($scope, $rootScope, $route, $state, $stateTransition) {
    $scope.routes = JSON.stringify($route.routes, null, 2);        $scope.statesStr = JSON.stringify(clean($state.root), null, 2);
    $scope.states = [clean($state.root)];        $scope.transitions = JSON.stringify($stateTransition.root, null, 2);
    $scope.opts = {
        backdropFade: true,
        dialogFade: true
    };
    
    $scope.$on('$viewUpdate', function (event,name) {
        printStack("Update event for view received: " + name);
    });
    
    $scope.$on('$stateChangeSuccess', function () {
        printStack("State Changed: " + $state.current.fullname);
    });
    $scope.openRoutes = function () {
        $scope.showRoutes = true;
    };    $scope.openStates = function () {
        $scope.showStates = true;
    };    $scope.openTransitions = function () {
        $scope.showTransitions = true;
    };    $scope.close = function () {
        $scope.showRoutes = false;
        $scope.showStates = false;
        $scope.showTransitions = false;
    };
}

function printStack(message) {
    var e = new Error('dummy');
    var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
      .replace(/^\s+at\s+/gm, '')
      .replace(/^Object.\s*\(/gm, '{anonymous}()@')
      .split('\n');

    if (message) console.log(message);
    console.log(stack);
    console.log('');
}