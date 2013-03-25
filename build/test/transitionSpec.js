describe('$transitionProvider', function () {
    'use strict';
    var mock = angular.mock;
    var scope;
    function stringify(tansition) {
        var children = [], targets = [];
        angular.forEach(tansition.targets, function (target, targetName) {
            targets.push(targetName + '+' + target.length);
        });
        angular.forEach(tansition.children, function (child, name) {
            children.push(name + stringify(child));
        });
        return '[' + targets.join() + '](' + children.join() + ')';
    }
    beforeEach(mock.module('ui.routing', function () {
        return function ($rootScope) {
            scope = $rootScope;
        };
    }));
    describe("transition targets", function () {
        it('valid passes', function () {
            var provider;
            mock.module(function ($stateProvider) {
                provider = $stateProvider;
            });
            mock.inject(function ($state) {
                provider.transition('*', '*', function () {
                }).transition('a', 'b', function () {
                }).transition('a.1', 'b.1', function () {
                }).transition('a.*', '*', function () {
                }).transition('*', 'b.*', function () {
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
                    provider.transition('', '', {
                    });
                }).toThrow("Invalid transition - from: '', to: ''.");
                expect(function () {
                    provider.transition('.', '.', {
                    });
                }).toThrow("Invalid transition - from: '.', to: '.'.");
                expect(function () {
                    provider.transition('*.', '*.', {
                    });
                }).toThrow("Invalid transition - from: '*.', to: '*.'.");
                expect(function () {
                    provider.transition('.one', 'one.', {
                    });
                }).toThrow("Invalid transition - from: '.one', to: 'one.'.");
                expect(function () {
                    provider.transition('*.one', 'one.*.one', {
                    });
                }).toThrow("Invalid transition - from: '*.one', to: 'one.*.one'.");
                expect(function () {
                    provider.transition('', '*', {
                    });
                }).toThrow("Invalid transition - from: ''.");
                expect(function () {
                    provider.transition('.*', 'valid', {
                    });
                }).toThrow("Invalid transition - from: '.*'.");
                expect(function () {
                    provider.transition('*.*', 'valid.*', {
                    });
                }).toThrow("Invalid transition - from: '*.*'.");
                expect(function () {
                    provider.transition('one.', 'valid.one', {
                    });
                }).toThrow("Invalid transition - from: 'one.'.");
                expect(function () {
                    provider.transition('.one', 'valid.two', {
                    });
                }).toThrow("Invalid transition - from: '.one'.");
                expect(function () {
                    provider.transition('*', '', {
                    });
                }).toThrow("Invalid transition - to: ''.");
                expect(function () {
                    provider.transition('valid', '.*', {
                    });
                }).toThrow("Invalid transition - to: '.*'.");
                expect(function () {
                    provider.transition('valid.*', '*.*', {
                    });
                }).toThrow("Invalid transition - to: '*.*'.");
                expect(function () {
                    provider.transition('valid.one', 'one.', {
                    });
                }).toThrow("Invalid transition - to: 'one.'.");
                expect(function () {
                    provider.transition('valid.two', '.one', {
                    });
                }).toThrow("Invalid transition - to: '.one'.");
            });
        });
        it('will broadcast $stateChangeSuccess that has the former state as argument', function () {
            mock.module(function ($stateProvider) {
                $stateProvider.transition('*', '*', function () {
                }).transition('blog.*', 'about.*', function () {
                });
            });
            mock.inject(function ($location, $route, $state) {
                expect(stringify($state.transition)).toBe('[](*[*+1](),blog[](*[about.*+1]()))');
            });
        });
        it('will broadcast $stateChangeSuccess that has the former state as argument', function () {
            mock.module(function ($stateProvider) {
                $stateProvider.transition('*', '*', function () {
                }).transition('blog.recent', 'blog.category', function () {
                }).transition('blog.archive', 'blog.category', function () {
                }).transition('blog.recent', 'blog.archive', function () {
                }).transition('blog.category', 'blog.archive', function () {
                }).transition('blog.archive', 'blog.recent', function () {
                }).transition('blog.category', 'blog.recent', function () {
                });
            });
            mock.inject(function ($location, $route, $state) {
                var expected = '[](' + '  *[*+1](' + '  ),' + '  blog[](' + '    recent  [ blog.category+1, blog.archive+1](),' + '    archive [ blog.category+1, blog.recent+1 ](),' + '    category[ blog.archive+1,  blog.recent+1 ]()' + '  )' + ')';
                expect(stringify($state.transition)).toBe(expected.replace(/\s+/g, ''));
            });
        });
        it('will broadcast $stateChangeSuccess that has the former state as argument', function () {
            mock.module(function ($stateProvider) {
                $stateProvider.transition('*', '*', function () {
                }).transition('blog.recent', 'blog.category', function () {
                }).transition('blog.recent', 'blog.category', function () {
                }).transition('blog.recent', 'blog.category', function () {
                }).transition('blog.recent', 'blog.archive', function () {
                }).transition('blog.recent', 'blog.archive', function () {
                }).transition('blog.recent', 'blog.archive', function () {
                });
            });
            mock.inject(function ($location, $route, $state) {
                var expected = '[](' + '  *[*+1](' + '  ),' + '  blog[](' + '    recent  [ blog.category+3, blog.archive+3]()' + '  )' + ')';
                expect(stringify($state.transition)).toBe(expected.replace(/\s+/g, ''));
            });
        });
    });
    describe("transition $routeChangeSuccess", function () {
        it('Global * -> * transition will be called', function () {
            var transitions = [];
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
                    route: '/about',
                    name: 'about'
                }).transition('*', '*', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        transitions.push({
                            from: $from,
                            to: $to
                        });
                    }                ]);
            });
            mock.inject(function ($location, $route, $state) {
                var spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', spy);
                $location.path('/blog/recent');
                scope.$digest();
                expect(transitions.length).toBe(1);
                expect(transitions[0].from.fullname).toBe('root');
                expect(transitions[0].to.fullname).toBe('root.blog.recent');
                $location.path('/blog/42');
                scope.$digest();
                expect(transitions.length).toBe(2);
                expect(transitions[1].from.fullname).toBe('root.blog.recent');
                expect(transitions[1].to.fullname).toBe('root.blog.details');
            });
        });
        it('Global * -> * transition will be called', function () {
            var blogAboutTransitions = [];
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
                    route: '/about',
                    name: 'about'
                }).state('about.cv', {
                    route: '/cv',
                    name: 'about.cv'
                }).transition('blog.*', 'about.*', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        blogAboutTransitions.push({
                            from: $from,
                            to: $to
                        });
                    }                ]).transition('blog', 'about.*', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        blogAboutTransitions.push({
                            from: $from,
                            to: $to
                        });
                    }                ]).transition('blog', 'about', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        blogAboutTransitions.push({
                            from: $from,
                            to: $to
                        });
                    }                ]);
            });
            mock.inject(function ($location, $route, $state) {
                var spy = jasmine.createSpy('mySpy');
                scope.$on('$stateChangeSuccess', spy);
                $location.path('/blog');
                scope.$digest();
                expect(blogAboutTransitions.length).toBe(0);
                $location.path('/about');
                scope.$digest();
                expect(blogAboutTransitions.length).toBe(1);
                expect(blogAboutTransitions[1].from.fullname).toBe('root.blog.recent');
                expect(blogAboutTransitions[1].to.fullname).toBe('root.blog.details');
            });
        });
    });
});
