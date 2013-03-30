/// <reference path="testcommon.ts" />

describe('$stateProvider', function () {
    'use strict';
    var mock = angular.mock;
    var scope: ng.IRootScopeService;

    function stringifyTransition(tansition) {
        var children = [],
            targets = [];

        angular.forEach(tansition.targets, (target, targetName) => {
            targets.push(targetName + '+' + target.length);
        });

        angular.forEach(tansition.children, (child, name) => {
            children.push(name + stringifyTransition(child));
        });
        return '[' + targets.join() + '](' + children.join() + ')';
    }

    function stringifyState(state) {
        var result = '(',
            children = [],
            targets = [];

        angular.forEach(state.children, (child, name) => {
            children.push(name + stringifyState(child));
        });

        return result + children.join() + ')';
    }

    function locate(state, locator) {
        var names: string[] = locator.split('.'),
            current = state;
        for (var i = 0; i < names.length; i++) {
            current = current.children[names[i]];
        }
        return current;
    }

    beforeEach(mock.module('ui.routing', function () {
        return function ($rootScope) {
            scope = $rootScope;
        };
    }));

    describe("state names", () => {
        it('valid passes', function () {
            var provider;
            mock.module(function ($stateProvider: ui.routing.IStateProvider) {
                provider = $stateProvider;
            });

            mock.inject(function ($state: ui.routing.IStateService) {
                provider
                    .state('valid', {})
                    .state('valid.sub1', {})
                    .state('valid.sub2', {})
                    .state('another', {})
                    .state('another.sub1', {});
            });
        });

        it('invalid throws errors', function () {
            var provider;
            mock.module(function ($stateProvider: ui.routing.IStateProvider) {
                provider = $stateProvider;
            });

            mock.inject(function ($state: ui.routing.IStateService) {
                expect(function () { provider.state('', {}); }).toThrow("Invalid name: ''.");
                expect(function () { provider.state('.!"#', {}); }).toThrow("Invalid name: '.!\"#'.");
                expect(function () { provider.state('.', {}); }).toThrow("Invalid name: '.'.");
                expect(function () { provider.state('almost.valid.', {}); }).toThrow("Invalid name: 'almost.valid.'.");
                expect(function () { provider.state('.almost.valid', {}); }).toThrow("Invalid name: '.almost.valid'.");

                expect(stringifyState($state.root)).toBe("()");
            });
        });

        it('invalid throws errors', function () {
            var provider;
            mock.module(function ($stateProvider: ui.routing.IStateProvider) {
                provider = $stateProvider;
            });

            mock.inject(function ($state: ui.routing.IStateService) {
                expect(function () { provider.state('valid.sub1', {}); }).toThrow("Could not locate 'valid' under 'root'.");
                expect(function () { provider.state('another.sub1', {}); }).toThrow("Could not locate 'another' under 'root'.");
                expect(stringifyState($state.root)).toBe("()");

                provider.state('valid', {});
                provider.state('another', {});
                expect(stringifyState($state.root)).toBe("(valid(),another())");

                expect(function () { provider.state('valid.sub1', {}); }).not.toThrow();
                expect(function () { provider.state('another.sub1', {}); }).not.toThrow();

                expect(function () { provider.state('valid.sub2.deep', {}); }).toThrow("Could not locate 'sub2' under 'root.valid'.");
                expect(function () { provider.state('another.sub2.deep', {}); }).toThrow("Could not locate 'sub2' under 'root.another'.");

                expect(stringifyState($state.root)).toBe("(valid(sub1()),another(sub1()))");
            });
        });
    })

    describe("state", () => {
        it('can define state', function () {
            mock.module(function ($stateProvider: ui.routing.IStateProvider) {
                $stateProvider
                    .state('blog', { name: 'blog' })
            });

            mock.inject(function ($state: ui.routing.IStateService) {
                expect(stringifyState($state.root)).toBe("(blog())");
            });
        });

        it('can define state hierarchy using . notation', function () {
            mock.module(function ($stateProvider: ui.routing.IStateProvider) {
                $stateProvider
                    .state('blog', { name: 'blog' })
                    .state('blog.recent', { name: 'recent' })
                    .state('blog.recent.under', { name: 'under' })
                    .state('blog.item', { name: 'item' })
            });

            mock.inject(function ($state: ui.routing.IStateService) {
                expect(stringifyState($state.root)).toBe("(blog(recent(under()),item()))");
            });
        });

        it('can overwrite state in hierarchy using . notation', function () {
            mock.module(function ($stateProvider: ui.routing.IStateProvider) {
                $stateProvider
                    .state('blog', { name: 'blog' })
                    .state('blog.recent', { name: 'xrecent' })
                    .state('blog.recent.under', { name: 'under' })
                    .state('blog.item', { name: 'item' })
                    .state('blog.recent', { name: 'recent' });
            });

            mock.inject(function ($state: ui.routing.IStateService) {
                var state = locate($state.root, 'blog.recent');
                expect(state.self.name).toBe('recent');
                expect(state.fullname).toBe('root.blog.recent');
            });
        });

        it('can define hierarchy using object notation', function () {
            mock.module(function ($stateProvider: ui.routing.IStateProvider) {
                $stateProvider
                    .state('blog', {
                        name: 'blog',
                        children: {
                            recent: {
                                name: 'recent',
                                children: {
                                    under: { name: 'under' }
                                }
                            },
                            item: { name: 'item' }
                        }
                    })
            });

            mock.inject(function ($state: ui.routing.IStateService) {
                expect(stringifyState($state.root)).toBe("(blog(recent(under()),item()))");
            });
        });

        it('can overwrite state in hierarchy using object notation', function () {
            mock.module(function ($stateProvider: ui.routing.IStateProvider) {
                $stateProvider
                    .state('blog', {
                        name: 'blog',
                        children: {
                            recent: {
                                name: 'xrecent',
                                children: {
                                    under: { name: 'under' }
                                }
                            },
                            item: { name: 'item' }
                        }
                    })
                    .state('blog', {
                        name: 'blog',
                        children: {
                            recent: {
                                name: 'recent'
                            }
                        }
                    });
            });

            mock.inject(function ($state: ui.routing.IStateService) {
                var state = locate($state.root, 'blog.recent');
                expect(state.self.name).toBe('recent');
                expect(state.fullname).toBe('root.blog.recent');
                expect(stringifyState($state.root)).toBe("(blog(recent(under()),item()))");
            });
        });

        it('can overwrite state in hierarchy using . notation after having used object notation', function () {
            mock.module(function ($stateProvider: ui.routing.IStateProvider) {
                $stateProvider
                    .state('blog', {
                        name: 'blog',
                        children: {
                            recent: {
                                name: 'xrecent',
                                children: {
                                    under: { name: 'under' }
                                }
                            },
                            item: { name: 'item' }
                        }
                    })
                    .state('blog.recent', { name: 'recent' });
            });

            mock.inject(function ($state: ui.routing.IStateService) {
                var state = locate($state.root, 'blog.recent');
                expect(state.self.name).toBe('recent');
                expect(state.fullname).toBe('root.blog.recent');
                expect(stringifyState($state.root)).toBe("(blog(recent(under()),item()))");
            });
        });

        it('can clear children under a state using null', function () {
            mock.module(function ($stateProvider: ui.routing.IStateProvider) {
                $stateProvider
                    .state('blog', { name: 'blog' })
                    .state('blog.recent', { name: 'recent' })
                    .state('blog.recent.under', { name: 'under' })
                    .state('blog.item', { name: 'item' })
                    .state('blog.recent', { children: null });
            });

            mock.inject(function ($state: ui.routing.IStateService) {
                expect(stringifyState($state.root)).toBe("(blog(recent(),item()))");
            });
        });
    });

    //Note: These are essentialy integration tests between $location, $route and $state.
    //      because I haven't been able to sucessfully mock out $route.current for some reason.

    describe("state $routeChangeSuccess", () => {
        it('will broadcast $stateChangeSuccess and set current state', function () {
            mock.module(function (
                $stateProvider: ui.routing.IStateProvider,
                $routeProvider: ui.routing.IRouteProvider) {
                $stateProvider
                    .state('blog', { name: 'blog' })
                    .state('about', { name: 'about' })
                $routeProvider
                    .when('/blog', { state: 'blog' })
                    .when('/about', { state: 'about' });
            });

            mock.inject(function ($location, $route, $state: ui.routing.IStateService) {
                var spy: jasmine.Spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', <any>spy);

                $location.path('/blog');
                scope.$digest();

                expect($state.current.name).toBe('blog');
                expect(spy.mostRecentCall.args[2].fullname).toBe('root');
            });
        });

        it('will broadcast $stateChangeSuccess that has the former state as argument', function () {
            mock.module(function (
                $stateProvider: ui.routing.IStateProvider,
                $routeProvider: ui.routing.IRouteProvider) {

                $stateProvider
                    .state('blog', { name: 'blog' })
                    .state('about', { name: 'about' })

                $routeProvider
                    .when('/blog', { state: 'blog' })
                    .when('/about', { state: 'about' });
            });

            mock.inject(function ($location, $route, $state: ui.routing.IStateService) {
                var spy: jasmine.Spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', <any>spy);

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
            mock.module(function (
                $stateProvider: ui.routing.IStateProvider,
                $routeProvider: ui.routing.IRouteProvider) {

                $stateProvider
                    .state('blog', { name: 'blog' })
                    .state('blog.recent', { name: 'blog.recent' })
                    .state('blog.details', { name: 'blog.details' })
                    .state('about', { name: 'about' });

                $routeProvider
                    .when('/blog', { state: 'blog' })
                    .when('/blog/recent', { state: 'blog.recent' })
                    .when('/blog/{num:id}', { state: 'blog.details' })
                    .when('/about', { state: 'about' });
            });

            mock.inject(function ($location, $route, $state: ui.routing.IStateService) {
                var spy: jasmine.Spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', <any>spy);

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
            mock.module(function (
                $stateProvider: ui.routing.IStateProvider) {

                $stateProvider
                    .state('blog', { route: '/blog', name: 'blog' })
                    .state('blog.recent', { route: '/recent', name: 'blog.recent' })
                    .state('blog.details', { route: '/{num:id}', name: 'blog.details' })
                    .state('about', { route: '/blog', name: 'about' });
            });

            mock.inject(function ($location, $route, $state: ui.routing.IStateService) {
                var spy: jasmine.Spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', <any>spy);

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
            mock.module(function ($stateProvider: ui.routing.IStateProvider) {
                $stateProvider
                    .state('top', { route: '/top', name: 'top' })
                    .state('top.center', { name: 'top.center' })
                    .state('top.center.one', { route: '/one', name: 'top.center.one' })
                    .state('top.center.two', { route: '/two', name: 'top.center.two' });
            });

            mock.inject(function ($location, $route, $state: ui.routing.IStateService) {
                var spy: jasmine.Spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', <any>spy);

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

        it('states with parameters get invoked on parameter change', function () {            mock.module(function ($stateProvider: ui.routing.IStateProvider) {                $stateProvider
                    .state('top', { route: '/top/:top', name: 'top', views: { 'top': { template: "top" } } })
                    .state('top.sub', { route: '/sub/:sub', name: 'sub', views: { 'sub': { template: "sub" } } })
                    .state('top.sub.bot', { route: '/bot/:bot', name: 'bot', views: { 'bot': { template: "bot" } } })
            });

            mock.inject(function ($location, $route, $state: ui.routing.IStateService, $view: ui.routing.IViewService) {                function go(path: string) {
                    $location.path(path);
                    scope.$digest();
                };                //$view.setOrUpdate(name, view.template, view.controller)                var viewSpy = spyOn($view, 'setOrUpdate');                var spy: jasmine.Spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', <any>spy);
                                
                go('/top/1');
                expect($state.current.name).toBe('top');
                expect($state.current.params.all.top).toBe('1');
                expect(spy.wasCalled).toBe(true);

                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('top');

                spy.reset();
                viewSpy.reset();
                go('/top/2');
                expect($state.current.name).toBe('top');
                expect($state.current.params.all.top).toBe('2');
                expect(spy.wasCalled).toBe(true);

                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('top');

                spy.reset();
                viewSpy.reset();
                go('/top/1/sub/1');
                expect($state.current.name).toBe('sub');
                expect($state.current.params.all.top).toBe('1');
                expect($state.current.params.all.sub).toBe('1');
                expect(spy.wasCalled).toBe(true);

                expect(viewSpy.callCount).toBe(2);
                expect(viewSpy.calls[0].args[0]).toBe('top');
                expect(viewSpy.calls[1].args[0]).toBe('sub');

                spy.reset();
                viewSpy.reset();
                go('/top/1/sub/2');
                expect($state.current.name).toBe('sub');
                expect($state.current.params.all.top).toBe('1');
                expect($state.current.params.all.sub).toBe('2');
                expect(spy.wasCalled).toBe(true);

                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('sub');

                spy.reset();
                viewSpy.reset();
                go('/top/2/sub/2');
                expect($state.current.name).toBe('sub');
                expect($state.current.params.all.top).toBe('2');
                expect($state.current.params.all.sub).toBe('2');
                expect(spy.wasCalled).toBe(true);

                expect(viewSpy.callCount).toBe(2);
                expect(viewSpy.calls[0].args[0]).toBe('top');
                expect(viewSpy.calls[1].args[0]).toBe('sub');

                spy.reset();
                viewSpy.reset();
                go('/top/1/sub/1/bot/1');
                expect($state.current.name).toBe('bot');
                expect($state.current.params.all.top).toBe('1');
                expect($state.current.params.all.sub).toBe('1');
                expect($state.current.params.all.bot).toBe('1');
                expect(spy.wasCalled).toBe(true);

                expect(viewSpy.callCount).toBe(3);
                expect(viewSpy.calls[0].args[0]).toBe('top');
                expect(viewSpy.calls[1].args[0]).toBe('sub');
                expect(viewSpy.calls[2].args[0]).toBe('bot');

                spy.reset();
                viewSpy.reset();
                go('/top/1/sub/1/bot/2');
                expect($state.current.name).toBe('bot');
                expect($state.current.params.all.top).toBe('1');
                expect($state.current.params.all.sub).toBe('1');
                expect($state.current.params.all.bot).toBe('2');
                expect(spy.wasCalled).toBe(true);

                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('bot');

                spy.reset();
                viewSpy.reset();
                go('/top/2/sub/1/bot/2');
                expect($state.current.name).toBe('bot');
                expect($state.current.params.all.top).toBe('2');
                expect($state.current.params.all.sub).toBe('1');
                expect($state.current.params.all.bot).toBe('2');
                expect(spy.wasCalled).toBe(true);

                expect(viewSpy.callCount).toBe(3);
                expect(viewSpy.calls[0].args[0]).toBe('top');
                expect(viewSpy.calls[1].args[0]).toBe('sub');
                expect(viewSpy.calls[2].args[0]).toBe('bot');
            });        });
    });

    //Note: Integration tests between $transition and $state etc.

    describe("$transition $routeChangeSuccess", () => {
        it('Correct Transitions are called on state change.', function () {
            var last;
            mock.module(function ($stateProvider: ui.routing.IStateProvider) {
                $stateProvider
                        .state('home', { route: '/', name: 'about' })

                        .state('blog', { route: '/blog', name: 'blog' })
                        .state('blog.recent', { route: '/recent', name: 'blog.recent' })
                        .state('blog.other', { route: '/other', name: 'blog.recent' })

                        .state('about', { route: '/about', name: 'about' })
                        .state('about.cv', { route: '/cv', name: 'about.cv' })
                        .state('about.other', { route: '/other', name: 'about.other' })

                        .state('gallery', { route: '/gallery', name: 'about.cv' })
                        .state('gallery.overview', { route: '/overview', name: 'about.other' })
                        .state('gallery.details', { route: '/details', name: 'about.other' })

                        .transition('blog', 'about', [<any>'$from', '$to', ($from, $to) => { last = { name: 'blog->about', from: $from, to: $to }; }])
                        .transition('blog', 'gallery', [<any>'$from', '$to', ($from, $to) => { last = { name: 'blog->gallery', from: $from, to: $to }; }])
                        .transition('about', 'blog', [<any>'$from', '$to', ($from, $to) => { last = { name: 'about->blog', from: $from, to: $to }; }])
                        .transition('about', 'gallery', [<any>'$from', '$to', ($from, $to) => { last = { name: 'about->gallery', from: $from, to: $to }; }])
                        .transition('gallery', 'about', [<any>'$from', '$to', ($from, $to) => { last = { name: 'gallery->about', from: $from, to: $to }; }])
                        .transition('gallery', 'blog', [<any>'$from', '$to', ($from, $to) => { last = { name: 'gallery->blog', from: $from, to: $to }; }])
            });

            mock.inject(function ($location, $route, $state: ui.routing.IStateService) {
                function go(path: string) {
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

        it('Transitions can be canceled.', function () {            mock.module(function ($stateProvider: ui.routing.IStateProvider) {
                $stateProvider
                    .state('home', { route: '/', name: 'about' })

                    .state('blog', { route: '/blog', name: 'blog' })
                    .state('blog.recent', { route: '/recent', name: 'blog.recent' })
                    .state('blog.other', { route: '/other', name: 'blog.other' })

                    .state('about', { route: '/about', name: 'about' })
                    .state('about.cv', { route: '/cv', name: 'about.cv' })
                    .state('about.other', { route: '/other', name: 'about.other' })

                    .state('gallery', { route: '/gallery', name: 'gallery' })
                    .state('gallery.overview', { route: '/overview', name: 'gallery.overview' })
                    .state('gallery.details', { route: '/details', name: 'gallery.details' })

                    .state('admin', { route: '/admin', name: 'admin' })

                    .transition('*', 'admin', ($transition) => {
                        $transition.cancel();
                    });
            });

            mock.inject(function ($location, $route, $state: ui.routing.IStateService) {
                function go(path: string) {
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
});