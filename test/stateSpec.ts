/// <reference path="testcommon.ts" />

describe('$stateProvider', function () {
    'use strict';
    var mock = angular.mock;
    var mod = mock['module'];
    var inject = mock.inject;

    var scope: ng.IRootScopeService;
    var state: dotjem.routing.IStateService;

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

    beforeEach(mod('dotjem.routing', function () {
        return function ($rootScope) {
            scope = $rootScope;
        };
    }));

    describe("state names", () => {
        it('invalid throws errors', function () {
            var provider;
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
                provider = $stateProvider;
            });

            inject(function ($state: dotjem.routing.IStateService) {
                expect(function () { provider.state('valid.sub1', {}); })
                    .toThrow(test.replaceWithRoot("Could not locate 'valid' under 'root'."));
                expect(function () { provider.state('another.sub1', {}); })
                    .toThrow(test.replaceWithRoot("Could not locate 'another' under 'root'."));
                expect(stringifyState($state.root)).toBe("()");

                provider.state('valid', {});
                provider.state('another', {});
                expect(stringifyState($state.root)).toBe("(valid(),another())");

                expect(function () { provider.state('valid.sub1', {}); }).not.toThrow();
                expect(function () { provider.state('another.sub1', {}); }).not.toThrow();

                expect(function () { provider.state('valid.sub2.deep', {}); })
                    .toThrow(test.replaceWithRoot("Could not locate 'sub2' under 'root.valid'."));
                expect(function () { provider.state('another.sub2.deep', {}); })
                    .toThrow(test.replaceWithRoot("Could not locate 'sub2' under 'root.another'."));

                expect(stringifyState($state.root)).toBe("(valid(sub1()),another(sub1()))");
            });
        });
    })

    describe("state", () => {
        it('can define state', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
                $stateProvider
                    .state('blog', { name: 'blog' })
            });

            inject(function ($state: dotjem.routing.IStateService) {
                expect(stringifyState($state.root)).toBe("(blog())");
            });
        });

        it('can define onEnter', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
                $stateProvider
                    .state('blog', {
                        name: 'blog', onEnter: function () { }
                    })
            });

            inject(function ($state: dotjem.routing.IStateService) {
                expect(stringifyState($state.root)).toBe("(blog())");
            });
        });

        it('can define state hierarchy using . notation', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
                $stateProvider
                    .state('blog', { name: 'blog' })
                    .state('blog.recent', { name: 'recent' })
                    .state('blog.recent.under', { name: 'under' })
                    .state('blog.item', { name: 'item' })
            });

            inject(function ($state: dotjem.routing.IStateService) {
                expect(stringifyState($state.root)).toBe("(blog(recent(under()),item()))");
            });
        });

        it('can overwrite state in hierarchy using . notation', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
                $stateProvider
                    .state('blog', { name: 'blog' })
                    .state('blog.recent', { name: 'xrecent' })
                    .state('blog.recent.under', { name: 'under' })
                    .state('blog.item', { name: 'item' })
                    .state('blog.recent', { name: 'recent' });
            });

            inject(function ($state: dotjem.routing.IStateService) {
                var state = locate($state.root, 'blog.recent');
                expect(state.self.name).toBe('recent');
                expect(state.fullname).toBe(test.replaceWithRoot('root.blog.recent'));
            });
        });

        it('can define hierarchy using object notation', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
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

            inject(function ($state: dotjem.routing.IStateService) {
                expect(stringifyState($state.root)).toBe("(blog(recent(under()),item()))");
            });
        });

        it('can overwrite state in hierarchy using object notation', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
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

            inject(function ($state: dotjem.routing.IStateService) {
                var state = locate($state.root, 'blog.recent');
                expect(state.self.name).toBe('recent');
                expect(state.fullname).toBe(test.replaceWithRoot('root.blog.recent'));
                //TODO: Figure out which one we wan't, should we preserve children or not?
                //expect(stringifyState($state.root)).toBe("(blog(recent(under()),item()))");
                expect(stringifyState($state.root)).toBe("(blog(recent()))");
            });
        });

        it('can overwrite state in hierarchy using . notation after having used object notation', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
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

            inject(function ($state: dotjem.routing.IStateService) {
                var state = locate($state.root, 'blog.recent');
                expect(state.self.name).toBe('recent');
                expect(state.fullname).toBe(test.replaceWithRoot('root.blog.recent'));
                //TODO: Figure out which one we wan't, should we preserve children or not?
                //expect(stringifyState($state.root)).toBe("(blog(recent(under()),item()))");
                expect(stringifyState($state.root)).toBe("(blog(recent(),item()))");
            });
        });

        it('can clear children under a state using null', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
                $stateProvider
                    .state('blog', { name: 'blog' })
                    .state('blog.recent', { name: 'recent' })
                    .state('blog.recent.under', { name: 'under' })
                    .state('blog.item', { name: 'item' })
                    .state('blog.recent', { children: null });
            });

            inject(function ($state: dotjem.routing.IStateService) {
                expect(stringifyState($state.root)).toBe("(blog(recent(),item()))");
            });
        });
    });

    //Note: These are essentialy integration tests between $location, $route and $state.
    //      because I haven't been able to sucessfully mock out $route.current for some reason.

    describe("state $routeChangeSuccess", () => {
        it('will broadcast $stateChangeSuccess and set current state', function () {
            mod(function (
                $stateProvider: dotjem.routing.IStateProvider,
                $routeProvider: dotjem.routing.IRouteProvider) {
                $stateProvider
                    .state('blog', { name: 'blog' })
                    .state('about', { name: 'about' })
                $routeProvider
                    .when('/blog', { state: 'blog' })
                    .when('/about', { state: 'about' });
            });

            inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                var spy: jasmine.Spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', <any>spy);

                $location.path('/blog');
                scope.$digest();

                expect($state.current.name).toBe('blog');
                expect(spy.mostRecentCall.args[2].$fullname).toBe(test.replaceWithRoot('root'));
            });
        });

        it('will broadcast $stateChangeSuccess that has the former state as argument', function () {
            mod(function (
                $stateProvider: dotjem.routing.IStateProvider,
                $routeProvider: dotjem.routing.IRouteProvider) {

                $stateProvider
                    .state('blog', { name: 'blog' })
                    .state('about', { name: 'about' })

                $routeProvider
                    .when('/blog', { state: 'blog' })
                    .when('/about', { state: 'about' });
            });

            inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                var spy: jasmine.Spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', <any>spy);

                $location.path('/blog');
                scope.$digest();

                expect($state.current.name).toBe('blog');
                expect(spy.mostRecentCall.args[2].$fullname).toBe(test.replaceWithRoot('root'));

                $location.path('/about');
                scope.$digest();

                expect($state.current.name).toBe('about');
                expect(spy.mostRecentCall.args[2].name).toBe('blog');
            });
        });

        it('will broadcast $stateChangeSuccess that has the former state as argument', function () {
            mod(function (
                $stateProvider: dotjem.routing.IStateProvider,
                $routeProvider: dotjem.routing.IRouteProvider) {

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

            inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                var spy: jasmine.Spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', <any>spy);

                $location.path('/blog/recent');
                scope.$digest();

                expect($state.current.name).toBe('blog.recent');
                expect(spy.mostRecentCall.args[2].$fullname).toBe(test.replaceWithRoot('root'));

                $location.path('/blog/42');
                scope.$digest();

                expect($state.current.name).toBe('blog.details');
                expect(spy.mostRecentCall.args[2].name).toBe('blog.recent');
            });
        });

        it('will broadcast $stateChangeSuccess that has the former state as argument', function () {
            mod(function (
                $stateProvider: dotjem.routing.IStateProvider) {

                $stateProvider
                    .state('blog', { route: '/blog', name: 'blog' })
                    .state('blog.recent', { route: '/recent', name: 'blog.recent' })
                    .state('blog.details', { route: '/{num:id}', name: 'blog.details' })
                    .state('about', { route: '/blog', name: 'about' });
            });

            inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                var spy: jasmine.Spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', <any>spy);

                $location.path('/blog/recent');
                scope.$digest();

                expect($state.current.name).toBe('blog.recent');
                expect(spy.mostRecentCall.args[2].$fullname).toBe(test.replaceWithRoot('root'));

                $location.path('/blog/42');
                scope.$digest();

                expect($state.current.name).toBe('blog.details');
                expect(spy.mostRecentCall.args[2].name).toBe('blog.recent');
            });
        });

        it('can register states with and without routes', function () {

            mod(function ($stateProvider: dotjem.routing.IStateProvider) {

                $stateProvider
                    .state('top', { route: '/top', name: 'top' })
                    .state('top.center', { name: 'top.center' })
                    .state('top.center.one', { route: '/one', name: 'top.center.one' })
                    .state('top.center.two', { route: '/two', name: 'top.center.two' });

            });

            inject(function ($location, $route, $state: dotjem.routing.IStateService) {

                var spy: jasmine.Spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', <any>spy);

                $location.path('/top');
                scope.$digest();

                expect($state.current.name).toBe('top');
                expect(spy.mostRecentCall.args[2].$fullname).toBe(test.replaceWithRoot('root'));

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
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
                $stateProvider
                            .state('top', { route: '/top', name: 'top', views: { 'top': { template: "top" } } })
                            .state('top.sub', { route: '/sub', name: 'sub', views: { 'sub': { template: "sub" } } })
                            .state('top.sub.bot', { route: '/bot', name: 'bot', views: { 'bot': { template: "bot" } } })

                            .state('foo', { route: '/foo', name: 'foo', views: { 'foo': { template: "foo" } } })
                            .state('foo.bar', { route: '/bar', name: 'bar', views: { 'bar': { template: "bar" } } })
                            .state('foo.bar.baz', { route: '/baz', name: 'baz', views: { 'baz': { template: "baz" } } })
            });

            inject(function ($location, $route, $state: dotjem.routing.IStateService, $view: dotjem.routing.IViewService) {
                var trx = $view.beginUpdate();
                spyOn($view, 'beginUpdate').andReturn(trx);
                spyOn(trx, 'create');
                var viewSpy = spyOn(trx, 'update');
                var spy: jasmine.Spy = jasmine.createSpy('mySpy');

                function reset() { spy.reset(); viewSpy.reset(); }
                function go(path: string) {
                    reset();
                    $location.path(path);
                    scope.$digest();
                };

                scope.$on('$stateChangeSuccess', <any>spy);

                go('/top');
                expect($state.current.name).toBe('top');
                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('top');

                go('/top/sub');
                expect($state.current.name).toBe('sub');
                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('sub');

                go('/top/sub/bot');
                expect($state.current.name).toBe('bot');
                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('bot');

                go('/foo/bar/baz');
                expect($state.current.name).toBe('baz');
                expect(viewSpy.callCount).toBe(3);
                expect(viewSpy.calls[2].args[0]).toBe('baz');

                go('/foo/bar');
                expect($state.current.name).toBe('bar');
                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('bar');

            });
        });

        it('states invoke view service with sticky views', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
                $stateProvider
                    .state('top', {
                        route: '/top', name: 'top',
                        views: { 'top': { template: "top tpl", sticky: true } }
                    })
                    .state('top.sub', {
                        route: '/sub', name: 'sub',
                        views: { 'sub': { template: "sub tpl" } }
                    })

                    .state('foo', {
                        route: '/foo', name: 'foo',
                        views: { 'foo': { template: "foo tpl", sticky: "imSticky" } }
                    })
                    .state('foo.bar', {
                        route: '/bar', name: 'bar',
                        views: { 'bar': { template: "bar tpl" } }
                    })

                    .state('ban', {
                        route: '/ban', name: 'ban',
                        views: { 'ban': { template: "ban tpl", sticky: [<any>'$to', function (to) { return to.$fullname; }] } }
                    })
                    .state('ban.tar', {
                        route: '/tar', name: 'tar',
                        views: { 'tar': { template: "tar tpl" } }
                    })
            });

            inject(function ($location, $route, $state: dotjem.routing.IStateService, $view: dotjem.routing.IViewService) {
                var trx = $view.beginUpdate();
                spyOn($view, 'beginUpdate').andReturn(trx);
                spyOn(trx, 'create');
                var setOrUpdate = spyOn(trx, 'update');
                var spy: jasmine.Spy = jasmine.createSpy('mySpy');

                function reset() { spy.reset(); setOrUpdate.reset(); }
                function go(path: string) {
                    reset();
                    $location.path(path);
                    scope.$digest();
                };


                go('/top');
                expect($state.current.name).toBe('top');
                expect(setOrUpdate.calls[0].args)
                    .toEqual([<any>'top', {
                        template: "top tpl",
                        sticky: test.nameWithRoot('root.top'),
                        locals: {}
                    }]);

                go('/top/sub');
                expect($state.current.name).toBe('sub');
                expect(setOrUpdate.calls[0].args)
                    .toEqual([<any>'top', {
                        template: "top tpl",
                        sticky: test.nameWithRoot('root.top'),
                        locals: {}
                    }]);
                go('/foo/bar');
                expect($state.current.name).toBe('bar');
                expect(setOrUpdate.calls[0].args)
                    .toEqual([<any>'foo', {
                        template: 'foo tpl',
                        sticky: 'imSticky',
                        locals: {}
                    }]);

                go('/ban');
                expect($state.current.name).toBe('ban');
                expect(setOrUpdate.calls[0].args)
                    .toEqual([<any>'ban', {
                        template: 'ban tpl',
                        sticky: test.nameWithRoot('root.ban'),
                        locals: {}
                    }]);

                go('/ban/tar');
                expect($state.current.name).toBe('tar');
                expect(setOrUpdate.calls[0].args)
                    .toEqual([<any>'ban', {
                        template: 'ban tpl',
                        sticky: test.nameWithRoot('root.ban.tar'),
                        locals: {}
                    }]);
            });
        });

        it('can reload state', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
                $stateProvider
                            .state('top', { route: '/top', name: 'top', views: { 'top': { template: "top" } } })
                            .state('top.sub', { route: '/sub', name: 'sub', views: { 'sub': { template: "sub" } } })
                            .state('top.sub.bot', { route: '/bot', name: 'bot', views: { 'bot': { template: "bot" } } })

                            .state('foo', { route: '/foo', name: 'foo', views: { 'foo': { template: "foo" } } })
                            .state('foo.bar', { route: '/bar', name: 'bar', views: { 'bar': { template: "bar" } } })
                            .state('foo.bar.baz', { route: '/baz', name: 'baz', views: { 'baz': { template: "baz" } } })
            });

            inject(function ($location, $route, $state: dotjem.routing.IStateService, $view: dotjem.routing.IViewService) {
                var trx = $view.beginUpdate();
                spyOn($view, 'beginUpdate').andReturn(trx);
                spyOn(trx, 'create');
                var viewSpy = spyOn(trx, 'update');
                var spy: jasmine.Spy = jasmine.createSpy('mySpy');

                function reset() { spy.reset(); viewSpy.reset(); }
                function go(path: string) {
                    reset();
                    $location.path(path);
                    scope.$digest();
                };

                function reload(state?) {
                    reset();
                    $state.reload(state);
                    scope.$digest();
                }

                scope.$on('$stateChangeSuccess', <any>spy);

                go('/top');
                expect(viewSpy.callCount).toBe(1);

                reload();
                expect(viewSpy.callCount).toBe(1);

                go('/top/sub/bot');
                expect(viewSpy.callCount).toBe(2);

                reload();
                expect(viewSpy.callCount).toBe(1);

                reload(true);
                expect(viewSpy.callCount).toBe(3);

                reload('top.sub');
                expect(viewSpy.callCount).toBe(2);
            });
        });

        it('states with parameters get invoked on parameter change', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
                $stateProvider
                            .state('top', { route: '/top/:top', name: 'top', views: { 'top': { template: "top" } } })
                            .state('top.sub', { route: '/sub/:sub', name: 'sub', views: { 'sub': { template: "sub" } } })
                            .state('top.sub.bot', { route: '/bot/:bot', name: 'bot', views: { 'bot': { template: "bot" } } })
            });

            inject(function ($location, $route, $state: dotjem.routing.IStateService, $view: dotjem.routing.IViewService) {
                function go(path: string) {
                    $location.path(path);
                    scope.$digest();
                };

                var trx = $view.beginUpdate();
                spyOn($view, 'beginUpdate').andReturn(trx);
                spyOn(trx, 'create');
                var viewSpy = spyOn(trx, 'update');
                var spy: jasmine.Spy = jasmine.createSpy('mySpy');

                scope.$on('$stateChangeSuccess', <any>spy);

                go('/top/1');
                expect($state.current.name).toBe('top');
                expect($state.params.top).toBe('1');
                expect(spy.wasCalled).toBe(true);

                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('top');

                spy.reset();
                viewSpy.reset();
                go('/top/2');
                expect($state.current.name).toBe('top');
                expect($state.params.top).toBe('2');
                expect(spy.wasCalled).toBe(true);

                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('top');

                spy.reset();
                viewSpy.reset();
                go('/top/1/sub/1');
                expect($state.current.name).toBe('sub');
                expect($state.params.top).toBe('1');
                expect($state.params.sub).toBe('1');
                expect(spy.wasCalled).toBe(true);

                expect(viewSpy.callCount).toBe(2);
                expect(viewSpy.calls[0].args[0]).toBe('top');
                expect(viewSpy.calls[1].args[0]).toBe('sub');

                spy.reset();
                viewSpy.reset();
                go('/top/1/sub/2');
                expect($state.current.name).toBe('sub');
                expect($state.params.top).toBe('1');
                expect($state.params.sub).toBe('2');
                expect(spy.wasCalled).toBe(true);

                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('sub');

                spy.reset();
                viewSpy.reset();
                go('/top/2/sub/2');
                expect($state.current.name).toBe('sub');
                expect($state.params.top).toBe('2');
                expect($state.params.sub).toBe('2');
                expect(spy.wasCalled).toBe(true);

                expect(viewSpy.callCount).toBe(2);
                expect(viewSpy.calls[0].args[0]).toBe('top');
                expect(viewSpy.calls[1].args[0]).toBe('sub');

                spy.reset();
                viewSpy.reset();
                go('/top/1/sub/1/bot/1');
                expect($state.current.name).toBe('bot');
                expect($state.params.top).toBe('1');
                expect($state.params.sub).toBe('1');
                expect($state.params.bot).toBe('1');
                expect(spy.wasCalled).toBe(true);

                expect(viewSpy.callCount).toBe(3);
                expect(viewSpy.calls[0].args[0]).toBe('top');
                expect(viewSpy.calls[1].args[0]).toBe('sub');
                expect(viewSpy.calls[2].args[0]).toBe('bot');

                spy.reset();
                viewSpy.reset();
                go('/top/1/sub/1/bot/2');
                expect($state.current.name).toBe('bot');
                expect($state.params.top).toBe('1');
                expect($state.params.sub).toBe('1');
                expect($state.params.bot).toBe('2');
                expect(spy.wasCalled).toBe(true);

                expect(viewSpy.callCount).toBe(1);
                expect(viewSpy.calls[0].args[0]).toBe('bot');

                spy.reset();
                viewSpy.reset();
                go('/top/2/sub/1/bot/2');
                expect($state.current.name).toBe('bot');
                expect($state.params.top).toBe('2');
                expect($state.params.sub).toBe('1');
                expect($state.params.bot).toBe('2');
                expect(spy.wasCalled).toBe(true);

                expect(viewSpy.callCount).toBe(3);
                expect(viewSpy.calls[0].args[0]).toBe('top');
                expect(viewSpy.calls[1].args[0]).toBe('sub');
                expect(viewSpy.calls[2].args[0]).toBe('bot');
            });
        });
    });

    //Note: Integration tests between $transition and $state etc.

    describe("$transition $routeChangeSuccess", () => {
        it('Correct Transitions are called on state change.', function () {

            var last;
            mod(function ($stateProvider: dotjem.routing.IStateProvider, $stateTransitionProvider: dotjem.routing.ITransitionProvider) {
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
                        .state('gallery.details', { route: '/details', name: 'about.other' });

                $stateTransitionProvider
                        .transition('blog', 'about', [<any>'$from', '$to', ($from, $to) => { last = { name: 'blog->about', from: $from, to: $to }; }])
                        .transition('blog', 'gallery', [<any>'$from', '$to', ($from, $to) => { last = { name: 'blog->gallery', from: $from, to: $to }; }])
                        .transition('about', 'blog', [<any>'$from', '$to', ($from, $to) => { last = { name: 'about->blog', from: $from, to: $to }; }])
                        .transition('about', 'gallery', [<any>'$from', '$to', ($from, $to) => { last = { name: 'about->gallery', from: $from, to: $to }; }])

                        .transition('gallery', 'about', [<any>'$from', '$to', ($from, $to) => { last = { name: 'gallery->about', from: $from, to: $to }; }])

                        .transition('gallery', 'blog', [<any>'$from', '$to', ($from, $to) => { last = { name: 'gallery->blog', from: $from, to: $to }; }])
            });

            inject(function ($location, $route, $state: dotjem.routing.IStateService) {
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

        it('Transitions can be canceled.', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider, $stateTransitionProvider: dotjem.routing.ITransitionProvider) {

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

                    .state('admin', { route: '/admin', name: 'admin' });

                $stateTransitionProvider
                    .transition('*', 'admin', ($transition) => {
                        $transition.cancel();
                    });
            });

            inject(function ($location, $route, $state: dotjem.routing.IStateService) {
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

    //Note: Integration tests between $transition and $state etc.

    describe("goto", function () {

        beforeEach(mod('dotjem.routing', function ($stateProvider: dotjem.routing.IStateProvider, $stateTransitionProvider: dotjem.routing.ITransitionProvider) {

            $stateProvider
                .state('home', { route: '/', name: 'about' })

                .state('blog', { route: '/blog', name: 'blog' })
                .state('blog.recent', { route: '/recent', name: 'blog.recent' })
                .state('blog.other', { route: '/other', name: 'blog.other' })

                .state('about', { route: '/about', name: 'about' })
                .state('about.cv', { route: '/cv', name: 'about.cv' })
                .state('about.other', { route: '/other', name: 'about.other' })

                .state('gallery', { route: '/gallery/:id', name: 'gallery' })
                .state('gallery.overview', { route: '/overview', name: 'gallery.overview' })
                .state('gallery.details', { route: '/details/:page', name: 'gallery.details' })

                .state('admin', { route: '/admin', name: 'admin' });

            $stateTransitionProvider
                .transition('*', 'admin', ($transition) => {
                    $transition.cancel();
                });

            return function ($rootScope, $state) {
                scope = $rootScope;
                state = $state;
            };
        }));

        it('updates location when route is present', function () {
            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService) {

                $state.goto('blog');
                expect($location.path()).toBe('/blog');

                $state.goto('about.other');
                expect($location.path()).toBe('/about/other');
            });
        });

        it('updates location when route is present and fills in parameters', function () {
            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService) {

                $state.goto('gallery', { id: 42 });
                expect($location.path()).toBe('/gallery/42');

                $state.goto('gallery', { id: 4224 });
                expect($location.path()).toBe('/gallery/4224');

                $state.goto('gallery.details', { id: 4224, page: 1 });
                expect($location.path()).toBe('/gallery/4224/details/1');
            });
        });

        it('updates location when route is present and fills in parameters and keeps those not defined', function () {
            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService) {

                $state.goto('gallery', { id: 42 });
                scope.$digest();
                expect($location.url()).toBe('/gallery/42');

                $state.goto('gallery.details', { page: 1 });
                scope.$digest();
                expect($location.url()).toBe('/gallery/42/details/1');

                $state.goto('gallery.details', { id: 2 });
                scope.$digest();
                expect($location.url()).toBe('/gallery/2/details/1');

                $state.goto('gallery.details', { id: 33, page: 42 });
                scope.$digest();
                expect($location.url()).toBe('/gallery/33/details/42');
            });
        });

        it('updates location when route is present and puts aditional parameters on search', function () {
            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService) {

                $state.goto('gallery', { id: 42, search: "woahh" });
                scope.$digest();
                expect($location.url()).toBe('/gallery/42?search=woahh');

                $state.goto('gallery.details', { page: 1 });
                scope.$digest();
                expect($location.url()).toBe('/gallery/42/details/1');

                $state.goto('gallery.details', { search: "woahh" });
                scope.$digest();
                expect($location.url()).toBe('/gallery/42/details/1?search=woahh');
            });
        });
    });

    describe("url", function () {

        beforeEach(mod('dotjem.routing', function (
            $stateProvider: dotjem.routing.IStateProvider,
            $stateTransitionProvider: dotjem.routing.ITransitionProvider) {

            $stateProvider
                .state('home', { route: '/', name: 'about' })

                .state('blog', { route: '/blog', name: 'blog' })
                .state('blog.recent', { route: '/recent', name: 'blog.recent' })
                .state('blog.other', { route: '/other', name: 'blog.other' })

                .state('about', { route: '/about', name: 'about' })
                .state('about.cv', { route: '/cv', name: 'about.cv' })
                .state('about.other', { route: '/other', name: 'about.other' })

                .state('gallery', { route: '/gallery/:id', name: 'gallery' })
                .state('gallery.overview', { route: '/overview', name: 'gallery.overview' })
                .state('gallery.details', { route: '/details/:page', name: 'gallery.details' })

                .state('admin', { route: '/admin', name: 'admin' });

            $stateTransitionProvider
                .transition('*', 'admin', ($transition) => {
                    $transition.cancel();
                });

            return function ($rootScope, $state) {
                scope = $rootScope;
                state = $state;
            };
        }));

        function goto(target, params?) {
            state.goto(target, params);
            scope.$digest();
        }

        it('builds route', function () {
            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService) {

                goto('blog');
                expect($state.url()).toBe('/blog');
                expect($state.url('blog')).toBe('/blog');

                goto('about.other');
                expect($state.url()).toBe('/about/other');
                expect($state.url('about.other')).toBe('/about/other');
            });
        });

        it('builds route with parameters', function () {
            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService) {

                goto('gallery', { id: 42 });
                expect($state.url()).toBe('/gallery/42');
                expect($state.url(undefined, { id: 51 })).toBe('/gallery/51');
                expect($state.url('gallery')).toBe('/gallery/42');
                expect($state.url('gallery', { id: 51 })).toBe('/gallery/51');

                goto('gallery', { id: 4224 });
                expect($state.url()).toBe('/gallery/4224');

                goto('gallery.details', { id: 4224, page: 1 });
                expect($state.url()).toBe('/gallery/4224/details/1');
            });
        });

        it('builds route with parameters and basepath by default', function () {
            mod(function ($locationProvider: ng.ILocationProvider) {
                $locationProvider.html5Mode(true);
            })

            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService,
                $browser: ng.IBrowserService) {

                spyOn($browser, 'baseHref').andReturn('/base');

                goto('gallery', { id: 42 });
                expect($state.url()).toBe('/base/gallery/42');
                expect($state.url(undefined, { id: 51 })).toBe('/base/gallery/51');
                expect($state.url('gallery')).toBe('/base/gallery/42');
                expect($state.url('gallery', { id: 51 })).toBe('/base/gallery/51');

                goto('gallery', { id: 4224 });
                expect($state.url()).toBe('/base/gallery/4224');

                goto('gallery.details', { id: 4224, page: 1 });
                expect($state.url()).toBe('/base/gallery/4224/details/1');
            });
        });

        it('builds route with parameters and basepath', function () {
            mod(function ($locationProvider: ng.ILocationProvider) {
                $locationProvider.html5Mode(true);
            })

            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService,
                $browser: ng.IBrowserService) {

                spyOn($browser, 'baseHref').andReturn('/base');

                goto('gallery', { id: 42 });
                expect($state.url(true)).toBe('/base/gallery/42');
                expect($state.url(undefined, { id: 51 }, true)).toBe('/base/gallery/51');
                expect($state.url('gallery', true)).toBe('/base/gallery/42');
                expect($state.url('gallery', { id: 51 }, true)).toBe('/base/gallery/51');

                goto('gallery', { id: 4224 });
                expect($state.url(true)).toBe('/base/gallery/4224');

                goto('gallery.details', { id: 4224, page: 1 });
                expect($state.url(true)).toBe('/base/gallery/4224/details/1');
            });
        });

        it('builds route with parameters and without basepath', function () {
            mod(function ($locationProvider: ng.ILocationProvider) {
                $locationProvider.html5Mode(true);
            })

            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService,
                $browser: ng.IBrowserService) {

                spyOn($browser, 'baseHref').andReturn('/base');

                goto('gallery', { id: 42 });
                expect($state.url(false)).toBe('/gallery/42');
                expect($state.url(undefined, { id: 51 }, false)).toBe('/gallery/51');
                expect($state.url('gallery', false)).toBe('/gallery/42');
                expect($state.url('gallery', { id: 51 }, false)).toBe('/gallery/51');

                goto('gallery', { id: 4224 });
                expect($state.url(false)).toBe('/gallery/4224');

                goto('gallery.details', { id: 4224, page: 1 });
                expect($state.url(false)).toBe('/gallery/4224/details/1');
            });
        });

        it('builds route with search parameters', function () {
            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService) {

                goto('gallery', { id: 42 });
                expect($state.url()).toBe('/gallery/42');
                expect($state.url(undefined, { id: 51, search: 'hello' })).toBe('/gallery/51?search=hello');
                expect($state.url('gallery', { search: 'hello' })).toBe('/gallery/42?search=hello');
                expect($state.url('gallery', { id: 51, search: 'hello' })).toBe('/gallery/51?search=hello');
                
                goto('gallery', { id: 4224 });
                expect($state.url()).toBe('/gallery/4224');

                goto('gallery.details', { id: 4224, page: 1});
                expect($state.url(undefined, { search: 'search', other: 'other' })).toBe('/gallery/4224/details/1?search=search&other=other');
            });
        });

        it('builds route without base path', function () {
            mod(function ($locationProvider: ng.ILocationProvider) {
                $locationProvider.html5Mode(true);
            })

            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService,
                $browser: ng.IBrowserService) {

                spyOn($browser, 'baseHref').andReturn ('/base');

                goto('blog');
                expect($state.url(false)).toBe('/blog');
                expect($state.url('blog', false)).toBe('/blog');

                goto('about.other');
                expect($state.url(false)).toBe('/about/other');
                expect($state.url('about.other', false)).toBe('/about/other');
            });
        });

        it('builds route with base path', function () {
            mod(function($locationProvider: ng.ILocationProvider) {
                $locationProvider.html5Mode(true);
            });

            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService,
                $browser: ng.IBrowserService) {

                spyOn($browser, 'baseHref').andReturn('/base');

                goto('blog');
                expect($state.url(true)).toBe('/base/blog');
                expect($state.url('blog', true)).toBe('/base/blog');

                goto('about.other');
                expect($state.url(true)).toBe('/base/about/other');
                expect($state.url('about.other', true)).toBe('/base/about/other');
            });
        });

        it('builds route with basepath by default', function () {
            mod(function($locationProvider: ng.ILocationProvider) {
                $locationProvider.html5Mode(true);
            });

            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService,
                $browser: ng.IBrowserService) {

                spyOn($browser, 'baseHref').andReturn('/base');

                goto('blog');
                expect($state.url()).toBe('/base/blog');
                expect($state.url('blog')).toBe('/base/blog');

                goto('about.other');
                expect($state.url()).toBe('/base/about/other');
                expect($state.url('about.other')).toBe('/base/about/other');
            });
        });
    });

    describe("is", function () {

        beforeEach(mod('dotjem.routing', function ($stateProvider: dotjem.routing.IStateProvider, $stateTransitionProvider: dotjem.routing.ITransitionProvider) {

            $stateProvider
                .state('home', { route: '/', name: 'about' })

                .state('about', { route: '/about', name: 'about' })
                .state('about.cv', { route: '/cv', name: 'about.cv' })
                .state('about.cv.child', { route: '/cv', name: 'about.cv' })
                .state('about.other', { route: '/other', name: 'about.other' })

            return function ($rootScope, $state) {
                scope = $rootScope;
                state = $state;
            };
        }));

        function goto(target, params?) {
            state.goto(target, params);
            scope.$digest();
        }

        it('true on matched states', function () {
            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService) {

                goto('about');
                expect($state.is('about')).toBe(true);

                goto('about.other');
                expect($state.is('about.other')).toBe(true);
            });
        });

        it('false on unmatched states', function () {
            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService) {

                goto('about');
                expect($state.is('fubar')).toBe(false);

                goto('about.other');
                expect($state.is('about.fubar')).toBe(false);
            });
        });
    });

    describe("scrollTo", function () {

        beforeEach(mod('dotjem.routing', function ($stateProvider: dotjem.routing.IStateProvider, $stateTransitionProvider: dotjem.routing.ITransitionProvider) {

            $stateProvider
                .state('about', { scrollTo: null })
                .state('about.cv', { scrollTo: 'scollid' })
                .state('about.cv.child', {  })
                .state('about.other', { })
                .state('other', {  })

            return function ($rootScope, $state) {
                scope = $rootScope;
                state = $state;
            };
        }));

        function goto(target, params?) {
            state.goto(target, params);
            scope.$digest();
        }

        it('true on matched states', function () {
            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService) {

                expect($state.root.children.about.scrollTo).toBeNull();
                expect($state.root.children.about.children.cv.scrollTo).toBe('scollid');
                expect($state.root.children.about.children.cv.children.child.scrollTo).toBe('scollid');
                expect($state.root.children.about.children.other.scrollTo).toBeNull();
                expect($state.root.children.other.scrollTo).toBe('top');
            });
        });
    });

    describe("isActive", function () {

        beforeEach(mod('dotjem.routing', function ($stateProvider: dotjem.routing.IStateProvider, $stateTransitionProvider: dotjem.routing.ITransitionProvider) {

            $stateProvider
                .state('home', { route: '/', name: 'about' })

                .state('about', { route: '/about', name: 'about' })
                .state('about.cv', { route: '/cv', name: 'about.cv' })
                .state('about.cv.child', { route: '/cv', name: 'about.cv' })
                .state('about.other', { route: '/other', name: 'about.other' })

            return function ($rootScope, $state) {
                scope = $rootScope;
                state = $state;
            };
        }));

        function goto(target, params?) {
            state.goto(target, params);
            scope.$digest();
        }

        it('true on matched states', function () {
            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService) {

                goto('about');
                expect($state.isActive('about')).toBe(true);

                goto('about.other');
                expect($state.isActive('about.other')).toBe(true);
            });
        });

        it('true on child states', function () {
            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService) {

                goto('about.cv.child');
                expect($state.isActive('about')).toBe(true);

                goto('about.cv.child');
                expect($state.isActive('about.cv')).toBe(true);
            });
        });

        it('false on unmatched states', function () {
            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService) {

                goto('about');
                expect($state.isActive('fubar')).toBe(false);

                goto('about.other');
                expect($state.isActive('about.fubar')).toBe(false);
            });
        });

        it('false on unmatched parent states', function () {
            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService) {

                goto('about.cv.child');
                expect($state.isActive('about.fubar')).toBe(false);
                expect($state.isActive('fubar.cv')).toBe(false);
            });
        });

        it('false on partial state names', function () {
            inject(function ($location: ng.ILocationService,
                $route: ng.IRouteService,
                $state: dotjem.routing.IStateService) {

                goto('about.cv.child');
                expect($state.isActive('child')).toBe(false);
                expect($state.isActive('cv')).toBe(false);
            });
        });
    });

    describe("lookup", () => {
        beforeEach(mod('dotjem.routing', function ($stateProvider: dotjem.routing.IStateProvider) {
            for (var sta = 1; sta < 4; sta++) {
                var stateName = 'state' + sta;
                $stateProvider.state(stateName, {});
                for (var top = 1; top < 4; top++) {
                    var topName = stateName + ".top" + top;
                    $stateProvider.state(topName, {});
                    for (var mid = 1; mid < 4; mid++) {
                        var midName = topName + ".mid" + mid;
                        $stateProvider.state(midName, {});
                        for (var bot = 1; bot < 4; bot++) {
                            var botName = midName + ".bot" + bot;
                            $stateProvider.state(botName, {});
                        }
                    }
                }
            }
            return function ($rootScope, $state) {
                scope = $rootScope;
                state = $state;
            };
        }));

        function goto(target: string) {
            state.goto(target);
            scope.$digest();
        }

        describe('at root', function () {
            it('lookup ./state1', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    var state = $state.lookup("./state1");
                    expect(state.$fullname).toBe(test.replaceWithRoot('root.state1'));
                });
            });

            it('lookup state1/top3/mid2/bot1', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    var state = $state.lookup("state1/top3/mid2/bot1");
                    expect(state.$fullname).toBe(test.replaceWithRoot('root.state1.top3.mid2.bot1'));
                });
            });

            it('lookup [1]', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    var state = $state.lookup("[1]");
                    expect(state.$fullname).toBe(test.replaceWithRoot('root.state2'));
                });
            });
        });


        describe('at state1', function () {
            var target = 'state1';

            it('lookup state1.top2', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("state1.top2");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1.top2'));
                });
            });

            it('lookup ./top1', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("./top1");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1.top1'));
                });
            });

            it('lookup top3/mid2', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("top3/mid2");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1.top3.mid2'));
                });
            });

            it('lookup top3/mid2/bot1', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("top3/mid2/bot1");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1.top3.mid2.bot1'));
                });
            });

            it('lookup [0]', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("[0]");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1.top1'));
                });
            });

            it('lookup [-1]', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("[-1]");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1.top3'));
                });
            });

            it('lookup [-2]', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("[-2]");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1.top2'));
                });
            });

            it('lookup [1]', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("[1]");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1.top2'));
                });
            });

            it('lookup .', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup(".");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1'));
                });
            });

            it('lookup ../state2', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("../state2");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state2'));
                });
            });

            it('lookup ../state2/top2', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("../state2/top2");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state2.top2'));
                });
            });

            it('lookup /state2', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("/state2");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state2'));
                });
            });

            it('lookup $node(1)', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("$node(1)");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state2'));
                });
            });

            it('lookup $node(-1)', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("$node(-1)");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state3'));
                });
            });

            it('lookup $node(5)', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("$node(5)");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state3'));
                });
            });

            it('lookup $node(-7)', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("$node(-7)");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state3'));
                });
            });

            it('lookup .. throws error', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    expect(function () { $state.lookup(".."); })
                        .toThrow();
                });
            });

            it('lookup ../.. throws error', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    expect(function () { $state.lookup("../.."); })
                        .toThrow();
                });
            });

            it('lookup fubar throws error', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    expect(function () { $state.lookup("fubar"); })
                        .toThrow();
                });
            });

            it('lookup top3/fubar throws error', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    expect(function () { $state.lookup("top3/fubar"); })
                        .toThrow();
                });
            });
        });


        describe('at state1.top2.mid2', function () {
            var target = 'state1.top2.mid2';

            it('lookup state1.top2', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("state1.top2");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1.top2'));
                });
            });

            it('lookup ./bot1', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("./bot1");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1.top2.mid2.bot1'));
                });
            });

            it('lookup [0]', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("[0]");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1.top2.mid2.bot1'));
                });
            });

            it('lookup [-1]', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("[-1]");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1.top2.mid2.bot3'));
                });
            });

            it('lookup [-2]', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("[-2]");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1.top2.mid2.bot2'));
                });
            });

            it('lookup [1]', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("[1]");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1.top2.mid2.bot2'));
                });
            });

            it('lookup .', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup(".");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1.top2.mid2'));
                });
            });

            it('lookup ..', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("..");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1.top2'));
                });
            });

            it('lookup ../..', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("../..");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1'));
                });
            });

            it('lookup ../../top2', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("../../top2");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state1.top2'));
                });
            });

            it('lookup ../../../state2', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("../../../state2");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state2'));
                });
            });

            it('lookup ../../../state2/top2', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("../../../state2/top2");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state2.top2'));
                });
            });

            it('lookup /state2', function () {
                inject(function ($location, $route, $state: dotjem.routing.IStateService) {
                    goto(target);

                    var state = $state.lookup("/state2");
                    expect(state.$fullname).toBe(test.nameWithRoot('root.state2'));
                });
            });
        });
    });


    describe("resolve", () => {
        var loc;
        beforeEach(mod('dotjem.routing', function ($stateProvider: dotjem.routing.IStateProvider) {
            return function ($rootScope, $state, $view) {
                loc = []

                var trx = $view.beginUpdate();
                spyOn(trx, 'update').andCallFake(function (name: string, args: dotjem.routing.IView) {
                    loc.push(args.locals);
                });
                spyOn(trx, 'create').andCallFake(function (name: string, args: dotjem.routing.IView) {
                    loc.push(args.locals);
                });
                spyOn($view, 'beginUpdate').andReturn(trx);

                scope = $rootScope;
                state = $state;
            };
        }));

        function goto(target: string) {
            loc = [];
            state.goto(target);
            scope.$digest();
        }

        it('error raises error', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
                $stateProvider
                    .state('home', {
                        views: { tpl: { template: "tpl" } },
                        resolve: { home: function () { throw Error('42'); } }
                    })
            });

            inject(function ($view, $state: dotjem.routing.IStateService, $rootScope) {
                var spy = spyOn(scope, '$broadcast');
                spy.andCallThrough();

                goto("home");

                expect(spy.calls[0].args[0]).toBe('$viewPrep');
                expect(spy.calls[1].args[0]).toBe('$stateChangeStart');
                expect(spy.calls[2].args[0]).toBe('$stateChangeError');
            });
        });

        it('single resolve provides value', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
                $stateProvider
                    .state('home', {
                        views: { 'tpl': { template: "tpl" } },
                        resolve: { home: function () { return 42; } }
                    })
            });

            inject(function ($view, $state: dotjem.routing.IStateService) {
                goto("home");
                expect(loc[0]).toEqual({ home: 42 });
            });
        });

        it('to and from are available to resolves', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
                $stateProvider
                    .state('home', {
                        views: { 'tpl': { template: "tpl" } },
                        resolve: { home: function ($to, $from) { return $to.$fullname + " - " + $from.$fullname; } }
                    })
            });

            inject(function ($view, $state: dotjem.routing.IStateService) {
                goto("home");
                expect(loc[0]).toEqual({ home: test.replaceWithRoot("root.home - root") });
            });
        });

        it('multiple resolve provides values', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
                $stateProvider
                    .state('top', {
                        views: { 'tpl': { template: "tpl" } },
                        resolve: { top: function () { return "top stuff"; } }
                    })
                    .state('top.mid', {
                        views: { 'tpl': { template: "tpl" } },
                        resolve: { mid: function () { return "middle"; } }
                    })
                    .state('top.mid.low', {
                        views: { 'tpl': { template: "tpl" } },
                        resolve: { low: function () { return "lowser"; } }
                    })
            });

            inject(function ($view, $state: dotjem.routing.IStateService) {
                goto("top.mid.low");
                expect(loc[0]).toEqual({ top: 'top stuff' });
                expect(loc[1]).toEqual({ top: 'top stuff', mid: 'middle' });
                expect(loc[2]).toEqual({ top: 'top stuff', mid: 'middle', low: 'lowser' });
            });
        });

        it('can use parent resolves in resolve', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
                $stateProvider
                    .state('top', {
                        views: { 'tpl': { template: "tpl" } },
                        resolve: { first: function () { return "first"; } }
                    })
                    .state('top.mid', {
                        views: { 'tpl': { template: "tpl" } },
                        resolve: { second: function (first) { return first + " second"; } }
                    })
                    .state('top.mid.low', {
                        views: { 'tpl': { template: "tpl" } },
                        resolve: { last: function (second, first) { return first + " "+ second + " last"; } }
                    })
            });

            inject(function ($view, $state: dotjem.routing.IStateService) {
                goto("top.mid.low");
                expect(loc[0]).toEqual({ first: 'first' });
                expect(loc[1]).toEqual({ first: 'first', second: 'first second' });
                expect(loc[2]).toEqual({ first: 'first', second: 'first second', last: 'first first second last' });
            });
        });

        it('can use parent resolves in resolve', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
                $stateProvider
                    .state('top', {
                        views: { 'tpl': { template: "tpl" } },
                        resolve: { val: function () { return "first"; } }
                    })
                    .state('top.mid', {
                        views: { 'tpl': { template: "tpl" } },
                        resolve: { val: function (val) { return val + ".second"; } }
                    })
                    .state('top.mid.low', {
                        views: { 'tpl': { template: "tpl" } },
                        resolve: { val: function (val) { return val + ".last"; } }
                    })
            });

            inject(function ($view, $state: dotjem.routing.IStateService) {
                goto("top");
                expect(loc[0]).toEqual({ val: 'first' });

                goto("top.mid");
                expect(loc[1]).toEqual({ val: 'first.second' });

                goto("top.mid.low");
                expect(loc[2]).toEqual({ val: 'first.second.last' });
            });
        });

        it('multiple resolve with same name gets overwritten', function () {
            mod(function ($stateProvider: dotjem.routing.IStateProvider) {
                $stateProvider
                    .state('top', {
                        views: { 'tpl': { template: "tpl" } },
                        resolve: { top: () => { return "top stuff"; }, extra: () => { return "top"; } }
                    })
                    .state('top.mid', {
                        views: { 'tpl': { template: "tpl" } },
                        resolve: { mid: () => { return "middle"; }, extra: () => { return "mid"; } }
                    })
                    .state('top.mid.low', {
                        views: { 'tpl': { template: "tpl" } },
                        resolve: { low: () => { return "lowser"; }, extra: () => { return "low"; } }
                    })
            });

            inject(function ($view, $state: dotjem.routing.IStateService) {
                goto("top.mid.low");
                expect(loc[0]).toEqual({ top: 'top stuff', extra: 'top' });
                expect(loc[1]).toEqual({ top: 'top stuff', mid: 'middle', extra: 'mid' });
                expect(loc[2]).toEqual({ top: 'top stuff', mid: 'middle', low: 'lowser', extra: 'low' });
            });
        });
    });

    describe("reloadOnSearch", () => {
        var location: ng.ILocationService, spy: jasmine.Spy;
        beforeEach(mod('dotjem.routing', function ($stateProvider: dotjem.routing.IStateProvider) {
            $stateProvider
                .state('page', { route: '/page/:param' })
                .state('post', { route: '/post/:param', reloadOnSearch: false })
                .state('foo', {  })
                .state('bar', { reloadOnSearch: false })
                //reloadOnParams

            return function ($rootScope, $state, $location) {
                scope = $rootScope;
                state = $state;
                location = $location;
                
                spy = spyOn(scope, '$broadcast');
                spy.andCallThrough();
            };
        }));

        function go(path: string) {
            spy.reset();
            location.url(path);
            scope.$apply(function() { });
        }

        function goto(target: string, params: any) {
            spy.reset();
            state.goto(target, params);
            scope.$digest();
        }

        function find(event) {
            var events = [];

            angular.forEach(spy.calls, function(call: { args: any[]; }) {
                if (call.args[0] === event)
                    events.push(call);
            });

            if (events.length > 1)
                return events;
            return events[0];
        }

        it('adding search paramter when true causes transition', function () {
            inject(function ($view, $state: dotjem.routing.IStateService) {
                go('/page/42');
                expect(find('$stateChangeSuccess')).toBeDefined();

                go('/page/42?p=pre');
                expect(find('$stateChangeSuccess')).toBeDefined();
            });
        });

        it('adding search paramter when false causes update', function () {
            inject(function ($view, $state: dotjem.routing.IStateService) {
                go('/post/42');
                expect(find('$stateChangeSuccess')).toBeDefined();

                go('/post/42?p=pre');
                expect(find('$stateUpdate')).toBeDefined();
                expect($state.params.p).toBe('pre');
                expect($state.params.param).toBe('42');
                expect($state.params.$search.p).toBe('pre');
                expect($state.params.$path.param).toBe('42');
                expect(find('$stateChangeSuccess')).toBeUndefined();
            });
        });

        it('adding optional paramter when true causes transition', function () {
            inject(function ($view, $state: dotjem.routing.IStateService) {
                goto('page', { param: 42 });
                expect(find('$stateChangeSuccess')).toBeDefined();

                goto('page', { param: 42, p: 'pre' });
                expect(find('$stateChangeSuccess')).toBeDefined();
            });
        });

        it('adding optional paramter when false causes update', function () {
            inject(function ($view, $state: dotjem.routing.IStateService) {
                goto('post', { param: 42 });
                expect(find('$stateChangeSuccess')).toBeDefined();

                goto('post', { param: 42, p: 'pre' });
                expect(find('$stateUpdate')).toBeDefined();
                expect(find('$stateChangeSuccess')).toBeUndefined();
            });
        });

        it('with no route, all parameters are considered optional and raises change if true', function () {
            inject(function ($view, $state: dotjem.routing.IStateService) {
                goto('foo', { param: 42 });
                expect(find('$stateChangeSuccess')).toBeDefined();

                goto('foo', { param: 43 });
                expect(find('$stateChangeSuccess')).toBeDefined();
            });
        });

        it('with no route, all parameters are considered optional and raises update if false', function () {
            inject(function ($view, $state: dotjem.routing.IStateService) {
                goto('bar', { param: 42 });
                expect(find('$stateChangeSuccess')).toBeDefined();

                goto('bar', { param: 43 });
                expect(find('$stateUpdate')).toBeDefined();
                expect(find('$stateChangeSuccess')).toBeUndefined();
            });
        });

        it('no changes causes nothing', function () {
            inject(function ($view, $state: dotjem.routing.IStateService) {
                goto('bar', { param: 42 });
                expect(find('$stateChangeSuccess')).toBeDefined();

                goto('bar', { param: 42 });
                expect(find('$stateUpdate')).toBeUndefined();
                expect(find('$stateChangeSuccess')).toBeUndefined();
            });
        });
    });
});