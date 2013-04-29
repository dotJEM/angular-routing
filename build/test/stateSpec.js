/// <reference path="testcommon.ts" />
describe('$stateProvider', function () {
    'use strict';
    var mock = angular.mock;
    var scope;
    var state;
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
    //Note: These are essentialy integration tests between $location, $route and $state.
    //      because I haven't been able to sucessfully mock out $route.current for some reason.
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
                expect(spy.mostRecentCall.args[2].$fullname).toBe('root');
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
                expect(spy.mostRecentCall.args[2].$fullname).toBe('root');
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
                expect(spy.mostRecentCall.args[2].$fullname).toBe('root');
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
                expect(spy.mostRecentCall.args[2].$fullname).toBe('root');
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
                expect(spy.mostRecentCall.args[2].$fullname).toBe('root');
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
        it('states invoke view service with view on change', function () {
            mock.module(function ($stateProvider) {
                $stateProvider.state('top', {
                    route: '/top',
                    name: 'top',
                    views: {
                        'top': {
                            template: "top"
                        }
                    }
                }).state('top.sub', {
                    route: '/sub',
                    name: 'sub',
                    views: {
                        'sub': {
                            template: "sub"
                        }
                    }
                }).state('top.sub.bot', {
                    route: '/bot',
                    name: 'bot',
                    views: {
                        'bot': {
                            template: "bot"
                        }
                    }
                }).state('foo', {
                    route: '/foo',
                    name: 'foo',
                    views: {
                        'foo': {
                            template: "foo"
                        }
                    }
                }).state('foo.bar', {
                    route: '/bar',
                    name: 'bar',
                    views: {
                        'bar': {
                            template: "bar"
                        }
                    }
                }).state('foo.bar.baz', {
                    route: '/baz',
                    name: 'baz',
                    views: {
                        'baz': {
                            template: "baz"
                        }
                    }
                });
            });
            mock.inject(function ($location, $route, $state, $view) {
                spyOn($view, 'setIfAbsent');
                var viewSpy = spyOn($view, 'setOrUpdate');
                var spy = jasmine.createSpy('mySpy');
                function reset() {
                    spy.reset();
                    viewSpy.reset();
                }
                function go(path) {
                    $location.path(path);
                    scope.$digest();
                }
                ;
                scope.$on('$stateChangeSuccess', spy);
                go('/top');
                expect($state.current.name).toBe('top');
                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('top');
                reset();
                go('/top/sub');
                expect($state.current.name).toBe('sub');
                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('sub');
                reset();
                go('/top/sub/bot');
                expect($state.current.name).toBe('bot');
                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('bot');
                reset();
                go('/foo/bar/baz');
                expect($state.current.name).toBe('baz');
                expect(viewSpy.callCount).toBe(3);
                expect(viewSpy.calls[2].args[0]).toBe('baz');
                reset();
                go('/foo/bar');
                expect($state.current.name).toBe('bar');
                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('bar');
            });
        });
        it('can reload state', function () {
            mock.module(function ($stateProvider) {
                $stateProvider.state('top', {
                    route: '/top',
                    name: 'top',
                    views: {
                        'top': {
                            template: "top"
                        }
                    }
                }).state('top.sub', {
                    route: '/sub',
                    name: 'sub',
                    views: {
                        'sub': {
                            template: "sub"
                        }
                    }
                }).state('top.sub.bot', {
                    route: '/bot',
                    name: 'bot',
                    views: {
                        'bot': {
                            template: "bot"
                        }
                    }
                }).state('foo', {
                    route: '/foo',
                    name: 'foo',
                    views: {
                        'foo': {
                            template: "foo"
                        }
                    }
                }).state('foo.bar', {
                    route: '/bar',
                    name: 'bar',
                    views: {
                        'bar': {
                            template: "bar"
                        }
                    }
                }).state('foo.bar.baz', {
                    route: '/baz',
                    name: 'baz',
                    views: {
                        'baz': {
                            template: "baz"
                        }
                    }
                });
            });
            mock.inject(function ($location, $route, $state, $view) {
                spyOn($view, 'setIfAbsent');
                var viewSpy = spyOn($view, 'setOrUpdate');
                var spy = jasmine.createSpy('mySpy');
                function reset() {
                    spy.reset();
                    viewSpy.reset();
                }
                function go(path) {
                    reset();
                    $location.path(path);
                    scope.$digest();
                }
                ;
                function reload(state) {
                    reset();
                    $state.reload(state);
                    scope.$digest();
                }
                scope.$on('$stateChangeSuccess', spy);
                go('/top');
                expect(viewSpy.callCount).toBe(1);
                reload();
                expect(viewSpy.callCount).toBe(1);
                go('/top/sub/bot');
                expect(viewSpy.callCount).toBe(3);
                reload();
                expect(viewSpy.callCount).toBe(1);
                reload(true);
                expect(viewSpy.callCount).toBe(3);
                reload('top.sub');
                expect(viewSpy.callCount).toBe(2);
            });
        });
        it('states with parameters get invoked on parameter change', function () {
            mock.module(function ($stateProvider) {
                $stateProvider.state('top', {
                    route: '/top/:top',
                    name: 'top',
                    views: {
                        'top': {
                            template: "top"
                        }
                    }
                }).state('top.sub', {
                    route: '/sub/:sub',
                    name: 'sub',
                    views: {
                        'sub': {
                            template: "sub"
                        }
                    }
                }).state('top.sub.bot', {
                    route: '/bot/:bot',
                    name: 'bot',
                    views: {
                        'bot': {
                            template: "bot"
                        }
                    }
                });
            });
            mock.inject(function ($location, $route, $state, $view) {
                ($state).debug = true;
                ($state).debug = true;
                function go(path) {
                    $location.path(path);
                    scope.$digest();
                }
                ;
                var viewSpy = spyOn($view, 'setOrUpdate');
                spyOn($view, 'setIfAbsent');
                var spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', spy);
                go('/top/1');
                expect($state.current.name).toBe('top');
                expect($state.current.$params.all.top).toBe('1');
                expect(spy.wasCalled).toBe(true);
                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('top');
                spy.reset();
                viewSpy.reset();
                go('/top/2');
                expect($state.current.name).toBe('top');
                expect($state.current.$params.all.top).toBe('2');
                expect(spy.wasCalled).toBe(true);
                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('top');
                spy.reset();
                viewSpy.reset();
                go('/top/1/sub/1');
                expect($state.current.name).toBe('sub');
                expect($state.current.$params.all.top).toBe('1');
                expect($state.current.$params.all.sub).toBe('1');
                expect(spy.wasCalled).toBe(true);
                expect(viewSpy.callCount).toBe(2);
                expect(viewSpy.calls[0].args[0]).toBe('top');
                expect(viewSpy.calls[1].args[0]).toBe('sub');
                spy.reset();
                viewSpy.reset();
                go('/top/1/sub/2');
                expect($state.current.name).toBe('sub');
                expect($state.current.$params.all.top).toBe('1');
                expect($state.current.$params.all.sub).toBe('2');
                expect(spy.wasCalled).toBe(true);
                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('sub');
                spy.reset();
                viewSpy.reset();
                go('/top/2/sub/2');
                expect($state.current.name).toBe('sub');
                expect($state.current.$params.all.top).toBe('2');
                expect($state.current.$params.all.sub).toBe('2');
                expect(spy.wasCalled).toBe(true);
                expect(viewSpy.callCount).toBe(2);
                expect(viewSpy.calls[0].args[0]).toBe('top');
                expect(viewSpy.calls[1].args[0]).toBe('sub');
                spy.reset();
                viewSpy.reset();
                go('/top/1/sub/1/bot/1');
                expect($state.current.name).toBe('bot');
                expect($state.current.$params.all.top).toBe('1');
                expect($state.current.$params.all.sub).toBe('1');
                expect($state.current.$params.all.bot).toBe('1');
                expect(spy.wasCalled).toBe(true);
                expect(viewSpy.callCount).toBe(3);
                expect(viewSpy.calls[0].args[0]).toBe('top');
                expect(viewSpy.calls[1].args[0]).toBe('sub');
                expect(viewSpy.calls[2].args[0]).toBe('bot');
                spy.reset();
                viewSpy.reset();
                go('/top/1/sub/1/bot/2');
                expect($state.current.name).toBe('bot');
                expect($state.current.$params.all.top).toBe('1');
                expect($state.current.$params.all.sub).toBe('1');
                expect($state.current.$params.all.bot).toBe('2');
                expect(spy.wasCalled).toBe(true);
                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('bot');
                spy.reset();
                viewSpy.reset();
                go('/top/2/sub/1/bot/2');
                expect($state.current.name).toBe('bot');
                expect($state.current.$params.all.top).toBe('2');
                expect($state.current.$params.all.sub).toBe('1');
                expect($state.current.$params.all.bot).toBe('2');
                expect(spy.wasCalled).toBe(true);
                expect(viewSpy.callCount).toBe(3);
                expect(viewSpy.calls[0].args[0]).toBe('top');
                expect(viewSpy.calls[1].args[0]).toBe('sub');
                expect(viewSpy.calls[2].args[0]).toBe('bot');
            });
        });
    });
    //Note: Integration tests between $transition and $state etc.
    describe("$transition $routeChangeSuccess", function () {
        it('Correct Transitions are called on state change.', function () {
            var last;
            mock.module(function ($stateProvider, $stateTransitionProvider) {
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
                });
                $stateTransitionProvider.transition('blog', 'about', [
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
            mock.module(function ($stateProvider, $stateTransitionProvider) {
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
                    name: 'blog.other'
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
                    name: 'gallery'
                }).state('gallery.overview', {
                    route: '/overview',
                    name: 'gallery.overview'
                }).state('gallery.details', {
                    route: '/details',
                    name: 'gallery.details'
                }).state('admin', {
                    route: '/admin',
                    name: 'admin'
                });
                $stateTransitionProvider.transition('*', 'admin', function ($transition) {
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
                expect($state.current.name).toBe('blog');
                go('/gallery');
                go('/admin');
                expect($state.current.name).toBe('gallery');
                go('/about');
                go('/admin');
                expect($state.current.name).toBe('about');
            });
        });
    });
    //Note: Integration tests between $transition and $state etc.
    describe("$state lookup", function () {
        beforeEach(mock.module('ui.routing', function ($stateProvider) {
            $stateProvider.state('state1', {
            }).state('state1.top1', {
            }).state('state1.top1.mid1', {
            }).state('state1.top1.mid1.bot1', {
            }).state('state1.top1.mid1.bot2', {
            }).state('state1.top1.mid1.bot3', {
            }).state('state1.top1.mid2', {
            }).state('state1.top1.mid2.bot1', {
            }).state('state1.top1.mid2.bot2', {
            }).state('state1.top1.mid2.bot3', {
            }).state('state1.top1.mid3', {
            }).state('state1.top1.mid3.bot1', {
            }).state('state1.top1.mid3.bot2', {
            }).state('state1.top1.mid3.bot3', {
            }).state('state1.top2', {
            }).state('state1.top2.mid1', {
            }).state('state1.top2.mid1.bot1', {
            }).state('state1.top2.mid1.bot2', {
            }).state('state1.top2.mid1.bot3', {
            }).state('state1.top2.mid2', {
            }).state('state1.top2.mid2.bot1', {
            }).state('state1.top2.mid2.bot2', {
            }).state('state1.top2.mid2.bot3', {
            }).state('state1.top2.mid3', {
            }).state('state1.top2.mid3.bot1', {
            }).state('state1.top2.mid3.bot2', {
            }).state('state1.top2.mid3.bot3', {
            }).state('state1.top3', {
            }).state('state1.top3.mid1', {
            }).state('state1.top3.mid1.bot1', {
            }).state('state1.top3.mid1.bot2', {
            }).state('state1.top3.mid1.bot3', {
            }).state('state1.top3.mid2', {
            }).state('state1.top3.mid2.bot1', {
            }).state('state1.top3.mid2.bot2', {
            }).state('state1.top3.mid2.bot3', {
            }).state('state1.top3.mid3', {
            }).state('state1.top3.mid3.bot1', {
            }).state('state1.top3.mid3.bot2', {
            }).state('state1.top3.mid3.bot3', {
            }).state('state2', {
            }).state('state2.top1', {
            }).state('state2.top1.mid1', {
            }).state('state2.top1.mid1.bot1', {
            }).state('state2.top1.mid1.bot2', {
            }).state('state2.top1.mid1.bot3', {
            }).state('state2.top1.mid2', {
            }).state('state2.top1.mid2.bot1', {
            }).state('state2.top1.mid2.bot2', {
            }).state('state2.top1.mid2.bot3', {
            }).state('state2.top1.mid3', {
            }).state('state2.top1.mid3.bot1', {
            }).state('state2.top1.mid3.bot2', {
            }).state('state2.top1.mid3.bot3', {
            }).state('state2.top2', {
            }).state('state2.top2.mid1', {
            }).state('state2.top2.mid1.bot1', {
            }).state('state2.top2.mid1.bot2', {
            }).state('state2.top2.mid1.bot3', {
            }).state('state2.top2.mid2', {
            }).state('state2.top2.mid2.bot1', {
            }).state('state2.top2.mid2.bot2', {
            }).state('state2.top2.mid2.bot3', {
            }).state('state2.top2.mid3', {
            }).state('state2.top2.mid3.bot1', {
            }).state('state2.top2.mid3.bot2', {
            }).state('state2.top2.mid3.bot3', {
            }).state('state2.top3', {
            }).state('state2.top3.mid1', {
            }).state('state2.top3.mid1.bot1', {
            }).state('state2.top3.mid1.bot2', {
            }).state('state2.top3.mid1.bot3', {
            }).state('state2.top3.mid2', {
            }).state('state2.top3.mid2.bot1', {
            }).state('state2.top3.mid2.bot2', {
            }).state('state2.top3.mid2.bot3', {
            }).state('state2.top3.mid3', {
            }).state('state2.top3.mid3.bot1', {
            }).state('state2.top3.mid3.bot2', {
            }).state('state2.top3.mid3.bot3', {
            }).state('state3', {
            }).state('state3.top1', {
            }).state('state3.top1.mid1', {
            }).state('state3.top1.mid1.bot1', {
            }).state('state3.top1.mid1.bot2', {
            }).state('state3.top1.mid1.bot3', {
            }).state('state3.top1.mid2', {
            }).state('state3.top1.mid2.bot1', {
            }).state('state3.top1.mid2.bot2', {
            }).state('state3.top1.mid2.bot3', {
            }).state('state3.top1.mid3', {
            }).state('state3.top1.mid3.bot1', {
            }).state('state3.top1.mid3.bot2', {
            }).state('state3.top1.mid3.bot3', {
            }).state('state3.top2', {
            }).state('state3.top2.mid1', {
            }).state('state3.top2.mid1.bot1', {
            }).state('state3.top2.mid1.bot2', {
            }).state('state3.top2.mid1.bot3', {
            }).state('state3.top2.mid2', {
            }).state('state3.top2.mid2.bot1', {
            }).state('state3.top2.mid2.bot2', {
            }).state('state3.top2.mid2.bot3', {
            }).state('state3.top2.mid3', {
            }).state('state3.top2.mid3.bot1', {
            }).state('state3.top2.mid3.bot2', {
            }).state('state3.top2.mid3.bot3', {
            }).state('state3.top3', {
            }).state('state3.top3.mid1', {
            }).state('state3.top3.mid1.bot1', {
            }).state('state3.top3.mid1.bot2', {
            }).state('state3.top3.mid1.bot3', {
            }).state('state3.top3.mid2', {
            }).state('state3.top3.mid2.bot1', {
            }).state('state3.top3.mid2.bot2', {
            }).state('state3.top3.mid2.bot3', {
            }).state('state3.top3.mid3', {
            }).state('state3.top3.mid3.bot1', {
            }).state('state3.top3.mid3.bot2', {
            }).state('state3.top3.mid3.bot3', {
            });
            return function ($rootScope, $state) {
                scope = $rootScope;
                state = $state;
            };
        }));
        function goto(target) {
            state.goto(target);
            scope.$digest();
        }
        describe('at root', function () {
            it('lookup state1', function () {
                mock.inject(function ($location, $route, $state) {
                    var state = $state.lookup("state1");
                    expect(state.$fullname).toBe('root.state1');
                });
            });
            it('lookup ./state1', function () {
                mock.inject(function ($location, $route, $state) {
                    var state = $state.lookup("./state1");
                    expect(state.$fullname).toBe('root.state1');
                });
            });
            it('lookup /state1', function () {
                mock.inject(function ($location, $route, $state) {
                    var state = $state.lookup("/state1");
                    expect(state.$fullname).toBe('root.state1');
                });
            });
            it('lookup state1/top3', function () {
                mock.inject(function ($location, $route, $state) {
                    var state = $state.lookup("state1/top3");
                    expect(state.$fullname).toBe('root.state1.top3');
                });
            });
            it('lookup state1/top3/mid2/bot1', function () {
                mock.inject(function ($location, $route, $state) {
                    var state = $state.lookup("state1/top3/mid2/bot1");
                    expect(state.$fullname).toBe('root.state1.top3.mid2.bot1');
                });
            });
            it('lookup [0] returns root.state1', function () {
                mock.inject(function ($location, $route, $state) {
                    var state = $state.lookup("[0]");
                    expect(state.$fullname).toBe('root.state1');
                });
            });
            it('lookup [-1]', function () {
                mock.inject(function ($location, $route, $state) {
                    var state = $state.lookup("[-1]");
                    expect(state.$fullname).toBe('root.state3');
                });
            });
            it('lookup [-2]', function () {
                mock.inject(function ($location, $route, $state) {
                    var state = $state.lookup("[-2]");
                    expect(state.$fullname).toBe('root.state2');
                });
            });
            it('lookup [1]', function () {
                mock.inject(function ($location, $route, $state) {
                    var state = $state.lookup("[1]");
                    expect(state.$fullname).toBe('root.state2');
                });
            });
        });
        describe('at state1', function () {
            var target = 'state1';
            it('lookup top1', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("top1");
                    expect(state.$fullname).toBe('root.state1.top1');
                });
            });
            it('lookup ./top1', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("./top1");
                    expect(state.$fullname).toBe('root.state1.top1');
                });
            });
            it('lookup top3/mid2', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("top3/mid2");
                    expect(state.$fullname).toBe('root.state1.top3.mid2');
                });
            });
            it('lookup top3/mid2/bot1', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("top3/mid2/bot1");
                    expect(state.$fullname).toBe('root.state1.top3.mid2.bot1');
                });
            });
            it('lookup [0]', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("[0]");
                    expect(state.$fullname).toBe('root.state1.top1');
                });
            });
            it('lookup [-1]', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("[-1]");
                    expect(state.$fullname).toBe('root.state1.top3');
                });
            });
            it('lookup [-2]', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("[-2]");
                    expect(state.$fullname).toBe('root.state1.top2');
                });
            });
            it('lookup [1]', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("[1]");
                    expect(state.$fullname).toBe('root.state1.top2');
                });
            });
            it('lookup .', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup(".");
                    expect(state.$fullname).toBe('root.state1');
                });
            });
            it('lookup ../state2', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("../state2");
                    expect(state.$fullname).toBe('root.state2');
                });
            });
            it('lookup ../state2/top2', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("../state2/top2");
                    expect(state.$fullname).toBe('root.state2.top2');
                });
            });
            it('lookup /state2', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("/state2");
                    expect(state.$fullname).toBe('root.state2');
                });
            });
            it('lookup $node(1)', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("$node(1)");
                    expect(state.$fullname).toBe('root.state2');
                });
            });
            it('lookup $node(-1)', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("$node(-1)");
                    expect(state.$fullname).toBe('root.state3');
                });
            });
            it('lookup $node(5)', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("$node(5)");
                    expect(state.$fullname).toBe('root.state3');
                });
            });
            it('lookup $node(-7)', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("$node(-7)");
                    expect(state.$fullname).toBe('root.state3');
                });
            });
            it('lookup .. throws error', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    expect(function () {
                        $state.lookup("..");
                    }).toThrow();
                });
            });
            it('lookup ../.. throws error', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    expect(function () {
                        $state.lookup("../..");
                    }).toThrow();
                });
            });
            it('lookup fubar throws error', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    expect(function () {
                        $state.lookup("fubar");
                    }).toThrow();
                });
            });
            it('lookup top3/fubar throws error', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    expect(function () {
                        $state.lookup("top3/fubar");
                    }).toThrow();
                });
            });
        });
        describe('at state1.top2.mid2', function () {
            var target = 'state1.top2.mid2';
            it('lookup bot1', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("bot1");
                    expect(state.$fullname).toBe('root.state1.top2.mid2.bot1');
                });
            });
            it('lookup ./bot1', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("./bot1");
                    expect(state.$fullname).toBe('root.state1.top2.mid2.bot1');
                });
            });
            it('lookup [0]', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("[0]");
                    expect(state.$fullname).toBe('root.state1.top2.mid2.bot1');
                });
            });
            it('lookup [-1]', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("[-1]");
                    expect(state.$fullname).toBe('root.state1.top2.mid2.bot3');
                });
            });
            it('lookup [-2]', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("[-2]");
                    expect(state.$fullname).toBe('root.state1.top2.mid2.bot2');
                });
            });
            it('lookup [1]', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("[1]");
                    expect(state.$fullname).toBe('root.state1.top2.mid2.bot2');
                });
            });
            it('lookup .', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup(".");
                    expect(state.$fullname).toBe('root.state1.top2.mid2');
                });
            });
            it('lookup ../../top2', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("../../top2");
                    expect(state.$fullname).toBe('root.state1.top2');
                });
            });
            it('lookup ../../../state2', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("../../../state2");
                    expect(state.$fullname).toBe('root.state2');
                });
            });
            it('lookup ../../../state2/top2', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("../../../state2/top2");
                    expect(state.$fullname).toBe('root.state2.top2');
                });
            });
            it('lookup /state2', function () {
                mock.inject(function ($location, $route, $state) {
                    goto(target);
                    var state = $state.lookup("/state2");
                    expect(state.$fullname).toBe('root.state2');
                });
            });
        });
    });
});
