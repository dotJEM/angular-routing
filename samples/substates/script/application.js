﻿var app = angular.module('sample', ['ui.routing']);
           $routeProvider
           $stateProvider
                   route: '/',
                       'main': {
                           template: 'tpl/home.html',
                       },
                   }
               })
                   route: '/blog',
                       'main': {
                           template: 'tpl/blog.html',
                               $rootScope.page = "blog";
                           }
                       },
                           template: 'tpl/blog.list.html',
                               $scope.title = "Recent Posts";
                               $scope.posts = blog.getRecentPosts();
                           }
                       }
                   }
               })
                   route: '/category/{category}',
                       'hint': { template: { html: '@blog.category' } },
                           template: 'tpl/blog.list.html',
                               $scope.title = $routeParams.category;
                               $scope.posts = blog.getPostsByCategory($routeParams.category);
                           }
                       }
                   }
               })
                   route: '/archive/{archive}',
                           template: 'tpl/blog.list.html',
                               $scope.title = $routeParams.archive;
                               $scope.posts = blog.getPostsByArchive($routeParams.archive);
                           }
                       }
                   }
               })
                   route: '/post/{post}',
                           template: 'tpl/blog.post.html',
                               $scope.post = blog.getPost($routeParams.post);
                           }
                       }
                   }
               })
                   route: '/code',
                       'main': {
                           template: 'tpl/code.html',
                       },
                   }
               })
                   route: '/about',
                       'main': {
                           template: 'tpl/about.html',
                       },
                   }
               })
       }]);
app.service('blog', function () {
    var monthlong = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            title: 'Route Config',
            date: new Date(),
        },
        {
            title: 'State Config',
            date: new Date(),
        },
        {
            title: 'Transition Config',
        },
        {
            title: 'Other Config',
            date: new Date(),
        }
    this.getPost = function (title) {
        var result;
        angular.forEach(posts, function (post) {
            if (post.title === title)
                result = post;
        });
        return result;
    };

    this.getRecentPosts = function () {
        return posts.slice(0,5);
    };

    this.getPostsByCategory = function (category) {
        var result = [];
            if (post.category === category)
        });
    };

    this.getPostsByArchive = function (month) {
        var result = [];
            var postMonth = monthlong[post.date.getMonth()] + ' ' + post.date.getFullYear();
        });
    };
    this.getArchives = function () {
        var months = [];
            var month = monthlong[post.date.getMonth()] + ' ' + post.date.getFullYear();
        });
    };
    this.getCategories = function () {
        var categories = [];
            if (categories.indexOf(post.category) === -1)
        });
    };
});
function clean(state) {
    var newState = {};
    newState.self = state.self;
    angular.forEach(state.children, function (child, name) {
        newState.children[name] = clean(child);
    });
}
function PageController($scope, $route, $state, $transition) {
    $scope.routes = JSON.stringify($route.routes, null, 2);
}