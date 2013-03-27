describe('$stateProvider', function () {
    'use strict';
    var mock = angular.mock;
    var scope;
    function stringifyTransition(tansition) {
        var children = [], targets = [];
        angular.forEach(tansition.targets, function (target, targetName) {
            targets.push(targetName + '+' + target.length);
        });
        angular.forEach(tansition.children, function (child, name) {
            children.push(name + stringifyTransition(child));
        });
        return '[' + targets.join() + '](' + children.join() + ')';
    }
    function stringifyState(state) {
        var result = '(', children = [], targets = [];
        angular.forEach(state.children, function (child, name) {
            children.push(name + stringifyState(child));
        });
        return result + children.join() + ')';
    }
    function locate(state, locator) {
        var names = locator.split('.'), current = state;
        for(var i = 0; i < names.length; i++) {
            current = current.children[names[i]];
        }
        return current;
    }
    beforeEach(mock.module('ui.routing', function () {
        return function ($rootScope) {
            scope = $rootScope;
        };
    }));
    describe("state names", function () {
        it('valid passes', function () {
            var provider;
            mock.module(function ($stateProvider) {
                provider = $stateProvider;
            });
            mock.inject(function ($state) {
                provider.state('valid', {
                }).state('valid.sub1', {
                }).state('valid.sub2', {
                }).state('another', {
                }).state('another.sub1', {
                });
            });
        });
        it('invalid throws errors', function () {
            var provider;
            mock.module(function ($stateProvider) {
                provider = $stateProvider;
            });
            mock.inject(function ($state) {
                expect(function () {
                    provider.state('', {
                    });
                }).toThrow("Invalid name: ''.");
                expect(function () {
                    provider.state('.!"#', {
                    });
                }).toThrow("Invalid name: '.!\"#'.");
                expect(function () {
                    provider.state('.', {
                    });
                }).toThrow("Invalid name: '.'.");
                expect(function () {
                    provider.state('almost.valid.', {
                    });
                }).toThrow("Invalid name: 'almost.valid.'.");
                expect(function () {
                    provider.state('.almost.valid', {
                    });
                }).toThrow("Invalid name: '.almost.valid'.");
                expect(stringifyState($state.root)).toBe("()");
            });
        });
        it('invalid throws errors', function () {
            var provider;
            mock.module(function ($stateProvider) {
                provider = $stateProvider;
            });
            mock.inject(function ($state) {
                expect(function () {
                    provider.state('valid.sub1', {
                    });
                }).toThrow("Could not locate 'valid' under 'root'.");
                expect(function () {
                    provider.state('another.sub1', {
                    });
                }).toThrow("Could not locate 'another' under 'root'.");
                expect(stringifyState($state.root)).toBe("()");
                provider.state('valid', {
                });
                provider.state('another', {
                });
                expect(stringifyState($state.root)).toBe("(valid(),another())");
                expect(function () {
                    provider.state('valid.sub1', {
                    });
                }).not.toThrow();
                expect(function () {
                    provider.state('another.sub1', {
                    });
                }).not.toThrow();
                expect(function () {
                    provider.state('valid.sub2.deep', {
                    });
                }).toThrow("Could not locate 'sub2' under 'root.valid'.");
                expect(function () {
                    provider.state('another.sub2.deep', {
                    });
                }).toThrow("Could not locate 'sub2' under 'root.another'.");
                expect(stringifyState($state.root)).toBe("(valid(sub1()),another(sub1()))");
            });
        });
    });
    describe("state", function () {
        it('can define state', function () {
            mock.module(function ($stateProvider) {
                $stateProvider.state('blog', {
                    name: 'blog'
                });
            });
            mock.inject(function ($state) {
                expect(stringifyState($state.root)).toBe("(blog())");
            });
        });
        it('can define state hierarchy using . notation', function () {
            mock.module(function ($stateProvider) {
                $stateProvider.state('blog', {
                    name: 'blog'
                }).state('blog.recent', {
                    name: 'recent'
                }).state('blog.recent.under', {
                    name: 'under'
                }).state('blog.item', {
                    name: 'item'
                });
            });
            mock.inject(function ($state) {
                expect(stringifyState($state.root)).toBe("(blog(recent(under()),item()))");
            });
        });
        it('can overwrite state in hierarchy using . notation', function () {
            mock.module(function ($stateProvider) {
                $stateProvider.state('blog', {
                    name: 'blog'
                }).state('blog.recent', {
                    name: 'xrecent'
                }).state('blog.recent.under', {
                    name: 'under'
                }).state('blog.item', {
                    name: 'item'
                }).state('blog.recent', {
                    name: 'recent'
                });
            });
            mock.inject(function ($state) {
                var state = locate($state.root, 'blog.recent');
                expect(state.self.name).toBe('recent');
                expect(state.fullname).toBe('root.blog.recent');
            });
        });
        it('can define hierarchy using object notation', function () {
            mock.module(function ($stateProvider) {
                $stateProvider.state('blog', {
                    name: 'blog',
                    children: {
                        recent: {
                            name: 'recent',
                            children: {
                                under: {
                                    name: 'under'
                                }
                            }
                        },
                        item: {
                            name: 'item'
                        }
                    }
                });
            });
            mock.inject(function ($state) {
                expect(stringifyState($state.root)).toBe("(blog(recent(under()),item()))");
            });
        });
        it('can overwrite state in hierarchy using object notation', function () {
            mock.module(function ($stateProvider) {
                $stateProvider.state('blog', {
                    name: 'blog',
                    children: {
                        recent: {
                            name: 'xrecent',
                            children: {
                                under: {
                                    name: 'under'
                                }
                            }
                        },
                        item: {
                            name: 'item'
                        }
                    }
                }).state('blog', {
                    name: 'blog',
                    children: {
                        recent: {
                            name: 'recent'
                        }
                    }
                });
            });
            mock.inject(function ($state) {
                var state = locate($state.root, 'blog.recent');
                expect(state.self.name).toBe('recent');
                expect(state.fullname).toBe('root.blog.recent');
                expect(stringifyState($state.root)).toBe("(blog(recent(under()),item()))");
            });
        });
        it('can overwrite state in hierarchy using . notation after having used object notation', function () {
            mock.module(function ($stateProvider) {
                $stateProvider.state('blog', {
                    name: 'blog',
                    children: {
                        recent: {
                            name: 'xrecent',
                            children: {
                                under: {
                                    name: 'under'
                                }
                            }
                        },
                        item: {
                            name: 'item'
                        }
                    }
                }).state('blog.recent', {
                    name: 'recent'
                });
            });
            mock.inject(function ($state) {
                var state = locate($state.root, 'blog.recent');
                expect(state.self.name).toBe('recent');
                expect(state.fullname).toBe('root.blog.recent');
                expect(stringifyState($state.root)).toBe("(blog(recent(under()),item()))");
            });
        });
        it('can clear children under a state using null', function () {
            mock.module(function ($stateProvider) {
                $stateProvider.state('blog', {
                    name: 'blog'
                }).state('blog.recent', {
                    name: 'recent'
                }).state('blog.recent.under', {
                    name: 'under'
                }).state('blog.item', {
                    name: 'item'
                }).state('blog.recent', {
                    children: null
                });
            });
            mock.inject(function ($state) {
                expect(stringifyState($state.root)).toBe("(blog(recent(),item()))");
            });
        });
    });
    describe("state $routeChangeSuccess", function () {
        it('will broadcast $stateChangeSuccess and set current state', function () {
            mock.module(function ($stateProvider, $routeProvider) {
                $stateProvider.state('blog', {
                    name: 'blog'
                }).state('about', {
                    name: 'about'
                });
                $routeProvider.when('/blog', {
                    state: 'blog'
                }).when('/about', {
                    state: 'about'
                });
            });
            mock.inject(function ($location, $route, $state) {
                var spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', spy);
                $location.path('/blog');
                scope.$digest();
                expect($state.current.name).toBe('blog');
                expect(spy.mostRecentCall.args[2].fullname).toBe('root');
            });
        });
        it('will broadcast $stateChangeSuccess that has the former state as argument', function () {
            mock.module(function ($stateProvider, $routeProvider) {
                $stateProvider.state('blog', {
                    name: 'blog'
                }).state('about', {
                    name: 'about'
                });
                $routeProvider.when('/blog', {
                    state: 'blog'
                }).when('/about', {
                    state: 'about'
                });
            });
            mock.inject(function ($location, $route, $state) {
                var spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', spy);
                $location.path('/blog');
                scope.$digest();
                expect($state.current.name).toBe('blog');
                expect(spy.mostRecentCall.args[2].fullname).toBe('root');
                $location.path('/about');
                scope.$digest();
                expect($state.current.name).toBe('about');
                expect(spy.mostRecentCall.args[2].name).toBe('blog');
            });
        });
        it('will broadcast $stateChangeSuccess that has the former state as argument', function () {
            mock.module(function ($stateProvider, $routeProvider) {
                $stateProvider.state('blog', {
                    name: 'blog'
                }).state('blog.recent', {
                    name: 'blog.recent'
                }).state('blog.details', {
                    name: 'blog.details'
                }).state('about', {
                    name: 'about'
                });
                $routeProvider.when('/blog', {
                    state: 'blog'
                }).when('/blog/recent', {
                    state: 'blog.recent'
                }).when('/blog/{num:id}', {
                    state: 'blog.details'
                }).when('/about', {
                    state: 'about'
                });
            });
            mock.inject(function ($location, $route, $state) {
                var spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', spy);
                $location.path('/blog/recent');
                scope.$digest();
                expect($state.current.name).toBe('blog.recent');
                expect(spy.mostRecentCall.args[2].fullname).toBe('root');
                $location.path('/blog/42');
                scope.$digest();
                expect($state.current.name).toBe('blog.details');
                expect(spy.mostRecentCall.args[2].name).toBe('blog.recent');
            });
        });
        it('will broadcast $stateChangeSuccess that has the former state as argument', function () {
            mock.module(function ($stateProvider) {
                $stateProvider.state('blog', {
                    route: '/blog',
                    name: 'blog'
                }).state('blog.recent', {
                    route: '/recent',
                    name: 'blog.recent'
                }).state('blog.details', {
                    route: '/{num:id}',
                    name: 'blog.details'
                }).state('about', {
                    route: '/blog',
                    name: 'about'
                });
            });
            mock.inject(function ($location, $route, $state) {
                var spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', spy);
                $location.path('/blog/recent');
                scope.$digest();
                expect($state.current.name).toBe('blog.recent');
                expect(spy.mostRecentCall.args[2].fullname).toBe('root');
                $location.path('/blog/42');
                scope.$digest();
                expect($state.current.name).toBe('blog.details');
                expect(spy.mostRecentCall.args[2].name).toBe('blog.recent');
            });
        });
        it('can register states with and without routes', function () {
            mock.module(function ($stateProvider) {
                $stateProvider.state('top', {
                    route: '/top',
                    name: 'top'
                }).state('top.center', {
                    name: 'top.center'
                }).state('top.center.one', {
                    route: '/one',
                    name: 'top.center.one'
                }).state('top.center.two', {
                    route: '/two',
                    name: 'top.center.two'
                });
            });
            mock.inject(function ($location, $route, $state) {
                var spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', spy);
                $location.path('/top');
                scope.$digest();
                expect($state.current.name).toBe('top');
                expect(spy.mostRecentCall.args[2].fullname).toBe('root');
                $location.path('/top/one');
                scope.$digest();
                expect($state.current.name).toBe('top.center.one');
                expect(spy.mostRecentCall.args[2].name).toBe('top');
                $location.path('/top/two');
                scope.$digest();
                expect($state.current.name).toBe('top.center.two');
                expect(spy.mostRecentCall.args[2].name).toBe('top.center.one');
            });
        });
    });
    describe("$transition $routeChangeSuccess", function () {
        it('Correct Transitions are called on state change.', function () {
            var last;
            mock.module(function ($stateProvider) {
                $stateProvider.state('home', {
                    route: '/',
                    name: 'about'
                }).state('blog', {
                    route: '/blog',
                    name: 'blog'
                }).state('blog.recent', {
                    route: '/recent',
                    name: 'blog.recent'
                }).state('blog.other', {
                    route: '/other',
                    name: 'blog.recent'
                }).state('about', {
                    route: '/about',
                    name: 'about'
                }).state('about.cv', {
                    route: '/cv',
                    name: 'about.cv'
                }).state('about.other', {
                    route: '/other',
                    name: 'about.other'
                }).state('gallery', {
                    route: '/gallery',
                    name: 'about.cv'
                }).state('gallery.overview', {
                    route: '/overview',
                    name: 'about.other'
                }).state('gallery.details', {
                    route: '/details',
                    name: 'about.other'
                }).transition('blog', 'about', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        last = {
                            name: 'blog->about',
                            from: $from,
                            to: $to
                        };
                    }                ]).transition('blog', 'gallery', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        last = {
                            name: 'blog->gallery',
                            from: $from,
                            to: $to
                        };
                    }                ]).transition('about', 'blog', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        last = {
                            name: 'about->blog',
                            from: $from,
                            to: $to
                        };
                    }                ]).transition('about', 'gallery', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        last = {
                            name: 'about->gallery',
                            from: $from,
                            to: $to
                        };
                    }                ]).transition('gallery', 'about', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        last = {
                            name: 'gallery->about',
                            from: $from,
                            to: $to
                        };
                    }                ]).transition('gallery', 'blog', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        last = {
                            name: 'gallery->blog',
                            from: $from,
                            to: $to
                        };
                    }                ]);
            });
            mock.inject(function ($location, $route, $state) {
                function go(path) {
                    $location.path(path);
                    scope.$digest();
                }
                go('/blog');
                expect(last).toBeUndefined();
                go('/about');
                expect(last.name).toBe('blog->about');
                go('/gallery');
                expect(last.name).toBe('about->gallery');
                go('/blog');
                expect(last.name).toBe('gallery->blog');
                go('/gallery');
                expect(last.name).toBe('blog->gallery');
                go('/about');
                expect(last.name).toBe('gallery->about');
                go('/blog');
                expect(last.name).toBe('about->blog');
            });
        });
        it('Transitions can be canceled.', function () {
            mock.module(function ($stateProvider) {
                $stateProvider.state('home', {
                    route: '/',
                    name: 'about'
                }).state('blog', {
                    route: '/blog',
                    name: 'blog'
                }).state('blog.recent', {
                    route: '/recent',
                    name: 'blog.recent'
                }).state('blog.other', {
                    route: '/other',
                    name: 'blog.recent'
                }).state('about', {
                    route: '/about',
                    name: 'about'
                }).state('about.cv', {
                    route: '/cv',
                    name: 'about.cv'
                }).state('about.other', {
                    route: '/other',
                    name: 'about.other'
                }).state('gallery', {
                    route: '/gallery',
                    name: 'about.cv'
                }).state('gallery.overview', {
                    route: '/overview',
                    name: 'about.other'
                }).state('gallery.details', {
                    route: '/details',
                    name: 'about.other'
                }).state('admin', {
                    route: '/admin',
                    name: 'about.other'
                }).transition('*', 'admin', function ($transition) {
                    $transition.cancel();
                });
            });
            mock.inject(function ($location, $route, $state) {
                function go(path) {
                    $location.path(path);
                    scope.$digest();
                }
                go('/blog');
                go('/admin');
                go('/gallery');
                go('/admin');
                go('/about');
                go('/admin');
            });
        });
    });
});
