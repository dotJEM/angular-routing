angular.module('sample').service('blog', function ($timeout) {
    var monthlong = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];    var posts = sampleData.posts;
    this.getPost = function (title) {
        var result;
        angular.forEach(posts, function (post) {
            if (post.title === title)
                result = post;
        });
        result.views++;
        return $timeout( function() {
            return result;
        },500);
    };

    this.getRecentPosts = function () {
        return $timeout(function () {
            return posts.slice(0, 5);
        }, 700);
    };

    this.getPostsByCategory = function (category) {
        var result = [];        angular.forEach(posts, function (post) {
            if (post.category === category)                result.push(post);
        });        return $timeout(function () {
            return result;
        }, 2000);
    };

    this.getPostsByArchive = function (month) {
        var result = [];        angular.forEach(posts, function (post) {
            var postMonth = monthlong[post.date.getMonth()] + ' ' + post.date.getFullYear();            if (postMonth === month)                result.push(post);
        });        return $timeout(function () {
            return result;
        }, 500);
    };
    this.getArchives = function () {
        var months = [];        angular.forEach(posts, function (post) {
            var month = monthlong[post.date.getMonth()] + ' ' + post.date.getFullYear();            if (months.indexOf(month) === -1)                months.push(month);
        });        return $timeout(function () {
            return months;
        }, 500);
    };
    this.getCategories = function () {
        var categories = [];        angular.forEach(posts, function (post) {
            if (categories.indexOf(post.category) === -1)                categories.push(post.category);
        });        return $timeout(function () {
            return categories;
        }, 500);
    };
});