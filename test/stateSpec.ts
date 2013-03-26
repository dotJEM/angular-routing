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
    });

    //Note: Integration tests between $transition and $state etc.

    describe("$transition $routeChangeSuccess", () => {
        it('Global blog -> about transition will be called when entering about', function () {
            var message = [];

            mock.module(function ($stateProvider: ui.routing.IStateProvider) {
                $stateProvider
                    .state('blog', { route: '/blog', name: 'blog' })
                    .state('blog.recent', { route: '/recent', name: 'blog.recent' })
                    .state('blog.details', { route: '/{num:id}', name: 'blog.details' })
                    .state('about', { route: '/about', name: 'about' })
                    .state('about.cv', { route: '/cv', name: 'about.cv' })

                    .transition('blog.*', 'about', [<any>'$from', '$to', ($from, $to) => {
                        message.push("blog.* > about.*");
                    }])
                    .transition('blog', 'about.*', [<any>'$from', '$to', ($from, $to) => {
                        message.push("blog > about.*");
                    }])
                    .transition('blog.*', 'about', [<any>'$from', '$to', ($from, $to) => {
                        message.push("blog.* > about");
                    }])
                    .transition('blog', 'about', [<any>'$from', '$to', ($from, $to) => {
                        message.push("blog > about");
                    }])
            });

            mock.inject(function ($location, $route, $state: ui.routing.IStateService) {
                $location.path('/blog');
                scope.$digest();

                expect(message.length).toBe(0);

                $location.path('/about');
                scope.$digest();

                expect(message.join()).toBe('blog > about.*,blog > about,blog.* > about.*,blog.* > about');
                expect(message.length).toBe(4);
            });
        });

    });
});