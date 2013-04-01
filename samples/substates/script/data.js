var sampleData = {
    posts: [{
    title: 'Route Config',    content: 'Here you can see the code that is used to configure the $routeProvider in this sample.' +
                '<pre>' +
                '$routeProvider' +
                "\r\n    .otherwise({ redirectTo: '/' });" +
                "</pre>",    category: 'core',    date: new Date(2012, 4, 1),    views: 0,

    comments: [
        {
            title: "Comment",
            content: 'Just a comment'
        }
    ]
},
{
    title: 'State Config',    content: 'Here you can see the code that is used to configure the $routeProvider in this sample.' +
            '<br/><br/>' +
            '<pre>' +
            "$stateProvider\r\n    .state('home', {\r\n        route: '/',\r\n        views: {\r\n            'main': {\r\n                template: 'tpl/home.html',\r\n                controller: function($rootScope) { $rootScope.page = 'home'; }\r\n            },\r\n            'crumbs': {\r\n                template: 'tpl/crumbs.html',\r\n                controller: function($scope) {\r\n                    $scope.crumbs = [\r\n                        { link: '#/', title: 'home' }\r\n                    ];\r\n                }\r\n            }\r\n        }\r\n    })\r\n    .state('blog', {\r\n        route: '/blog',\r\n        views: {\r\n            'main': {\r\n                template: 'tpl/blog.html',\r\n                controller: function($rootScope, $scope, blog) {\r\n                    $rootScope.page = 'blog';\r\n                    $scope.categories = blog.getCategories();\r\n                    $scope.archives = blog.getArchives();\r\n                }\r\n            },\r\n            'crumbs': {\r\n                template: 'tpl/crumbs.html',\r\n                controller: function($scope) {\r\n                    $scope.crumbs = [\r\n                        { link: '#/blog', title: 'blog' }\r\n                    ];\r\n                }\r\n            },\r\n            'content': {\r\n                template: 'tpl/blog.list.html',\r\n                controller: function($scope, blog) {\r\n                    $scope.title = 'Recent Posts';\r\n                    $scope.posts = blog.getRecentPosts();\r\n                }\r\n            }\r\n        }\r\n    })\r\n    .state('blog.category', {\r\n        route: '/category/{category}',\r\n        views: {\r\n            'crumbs': {\r\n                template: 'tpl/crumbs.html',\r\n                controller: function($scope, $routeParams) {\r\n                    $scope.crumbs = [\r\n                        { link: '#/blog', title: 'blog' },\r\n                        { link: '#/blog/category/' + $routeParams.category, title: 'Category: ' + $routeParams.category }\r\n                    ];\r\n                }\r\n            },\r\n            'content': {\r\n                template: 'tpl/blog.list.html',\r\n                controller: function($scope, $routeParams, blog) {\r\n                    $scope.title = $routeParams.category;\r\n                    $scope.posts = blog.getPostsByCategory($routeParams.category);\r\n                }\r\n            }\r\n        }\r\n    })\r\n    .state('blog.archive', {\r\n        route: '/archive/{archive}',\r\n        views: {\r\n            'crumbs': {\r\n                template: 'tpl/crumbs.html',\r\n                controller: function($scope, $routeParams) {\r\n                    $scope.crumbs = [\r\n                        { link: '#/blog', title: 'blog' },\r\n                        { link: '#/blog/archive/' + $routeParams.archive, title: 'Archive: ' + $routeParams.archive }\r\n                    ];\r\n                }\r\n            },\r\n            'content': {\r\n                template: 'tpl/blog.list.html',\r\n                controller: function($scope, $routeParams, blog) {\r\n                    $scope.title = $routeParams.archive;\r\n                    $scope.posts = blog.getPostsByArchive($routeParams.archive);\r\n                }\r\n            }\r\n        }\r\n    })\r\n    .state('blog.post', {\r\n        route: '/post/{post}',\r\n        views: {\r\n            'crumbs': {\r\n                template: 'tpl/crumbs.html',\r\n                controller: function($scope, $routeParams) {\r\n                    $scope.crumbs = [\r\n                        { link: '#/blog', title: 'blog' },\r\n                        { link: '#/blog/post/' + $routeParams.post, title: 'Post: ' + $routeParams.post }\r\n                    ];\r\n                }\r\n            },\r\n            'content': {\r\n                template: 'tpl/blog.post.html',\r\n                controller: function($scope, $routeParams, blog) {\r\n                    printStack('Running controller for content');\r\n                    var post = blog.getPost($routeParams.post);\r\n                    $scope.post = post;\r\n                }\r\n            }\r\n        }\r\n    })\r\n    .state('blog.post.comments', {\r\n        route: '/comments',\r\n        views: {\r\n            'crumbs': {\r\n                template: 'tpl/crumbs.html',\r\n                controller: function($scope, $routeParams) {\r\n                    $scope.crumbs = [\r\n                        { link: '#/blog', title: 'blog' },\r\n                        { link: '#/blog/post/' + $routeParams.post, title: $routeParams.post }\r\n                    ];\r\n                }\r\n            },\r\n        }\r\n    })\r\n    .state('about', {\r\n        route: '/about',\r\n        views: {\r\n            'main': {\r\n                template: 'tpl/about.html',\r\n                controller: function($rootScope) { $rootScope.page = 'about'; }\r\n            },\r\n            'crumbs': {\r\n                template: 'tpl/crumbs.html',\r\n                controller: function($scope) {\r\n                    $scope.crumbs = [\r\n                        { link: '#/about', title: 'about' }\r\n                    ];\r\n                }\r\n            },\r\n        }\r\n    });"+            "</pre>",    category: 'core',
    date: new Date(2012, 3, 27),    views: 0,

    comments: [
        {
            title: "Comment",
            content: 'Just a comment'
        }
    ]
},
{
    title: 'Transition Config',    content: 'Just another post',    category: 'core',    date: new Date(2012, 3, 21),    views: 0,

    comments: [
        {
            title: "Comment",
            content: 'Just a comment'
        }
    ]
},
{
    title: 'Other Config',    content: 'Just another post',    category: 'other',
    date: new Date(2012, 3, 12),    views: 0,

    comments: [
        {
            title: "Comment",
            content: 'Just a comment'
        }
    ]
},
{
    title: 'Post 5',    content: 'Just another post',    category: 'other',
    date: new Date(2012, 3, 1),    views: 0,

    comments: [
        {
            title: "Comment",
            content: 'Just a comment'
        }
    ]
},
{
    title: 'Post 6',    content: 'Just another post',    category: 'other',
    date: new Date(2012, 2, 24),    views: 0,

    comments: [
        {
            title: "Comment",
            content: 'Just a comment'
        }
    ]
},
{
    title: 'Post 7',    content: 'Just another post',    category: 'other',
    date: new Date(2012, 2, 10),    views: 0,

    comments: [
        {
            title: "Comment",
            content: 'Just a comment'
        }
    ]
},
{
    title: 'Post 8',    content: 'Just another post',    category: 'other',
    date: new Date(2012, 2, 3),    views: 0,

    comments: [
        {
            title: "Comment",
            content: 'Just a comment'
        }
    ]

}    ]
}