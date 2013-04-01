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
    describe("find", function () {
    });
    describe("transition validation", function () {
        it('valid passes', function () {
            var provider;
            mock.module(function ($transitionProvider) {
                provider = $transitionProvider;
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
            mock.module(function ($transitionProvider) {
                provider = $transitionProvider;
            });
            mock.inject(function ($state) {
                expect(function () {
                    provider.transition('', ' ', {
                    });
                }).toThrow("Invalid transition - from: '', to: ' '.");
                expect(function () {
                    provider.transition('.', '..', {
                    });
                }).toThrow("Invalid transition - from: '.', to: '..'.");
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
        it('handlers can be registered on wildcards transitions', function () {
            mock.module(function ($transitionProvider) {
                $transitionProvider.transition('*', '*', function () {
                }).transition('blog.*', 'about.*', function () {
                });
            });
            mock.inject(function ($transition) {
                expect(stringify($transition.root)).toBe('[](*[*+1](),blog[](*[about.*+1]()))');
            });
        });
        it('handlers can be registered on specific transitions', function () {
            mock.module(function ($transitionProvider) {
                $transitionProvider.transition('*', '*', function () {
                }).transition('blog.recent', 'blog.category', function () {
                }).transition('blog.archive', 'blog.category', function () {
                }).transition('blog.recent', 'blog.archive', function () {
                }).transition('blog.category', 'blog.archive', function () {
                }).transition('blog.archive', 'blog.recent', function () {
                }).transition('blog.category', 'blog.recent', function () {
                });
            });
            mock.inject(function ($transition) {
                var expected = '[](' + '  *[*+1](' + '  ),' + '  blog[](' + '    recent  [ blog.category+1, blog.archive+1](),' + '    archive [ blog.category+1, blog.recent+1 ](),' + '    category[ blog.archive+1,  blog.recent+1 ]()' + '  )' + ')';
                expect(stringify($transition.root)).toBe(expected.replace(/\s+/g, ''));
            });
        });
        it('same handler can be registered for multiple transitions', function () {
            mock.module(function ($transitionProvider) {
                $transitionProvider.transition('*', '*', function () {
                }).transition([
                    'blog.recent', 
                    'blog.archive', 
                    'blog.category'
                ], [
                    'blog.recent', 
                    'blog.archive', 
                    'blog.category'
                ], function () {
                });
            });
            mock.inject(function ($transition) {
                var expected = '[](' + '  *[*+1](' + '  ),' + '  blog[](' + '    recent  [ blog.archive+1, blog.category+1](),' + '    archive [ blog.recent+1,  blog.category+1 ](),' + '    category[ blog.recent+1,  blog.archive+1 ]()' + '  )' + ')';
                expect(stringify($transition.root)).toBe(expected.replace(/\s+/g, ''));
            });
        });
        it('multiple handlers can be registered on the same tansition', function () {
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
            mock.inject(function ($transition) {
                var expected = '[](' + '  *[*+1](' + '  ),' + '  blog[](' + '    recent  [ blog.category+3, blog.archive+3]()' + '  )' + ')';
                expect(stringify($transition.root)).toBe(expected.replace(/\s+/g, ''));
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
            mock.inject(function ($location, $state, $transition) {
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
        it('Global blog -> about transition will be called when entering about', function () {
            var trs = [], message = [];
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
                        trs.push({
                            from: $from,
                            to: $to
                        });
                        message.push("blog.* > about.*");
                    }                ]).transition('blog', 'about.*', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        trs.push({
                            from: $from,
                            to: $to
                        });
                        message.push("blog > about.*");
                    }                ]).transition('blog.*', 'about', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        trs.push({
                            from: $from,
                            to: $to
                        });
                        message.push("blog.* > about");
                    }                ]).transition('blog', 'about', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        trs.push({
                            from: $from,
                            to: $to
                        });
                        message.push("blog > about");
                    }                ]);
            });
            mock.inject(function ($location, $route, $state) {
                $location.path('/blog');
                scope.$digest();
                expect(trs.length).toBe(0);
                $location.path('/about');
                scope.$digest();
                expect(message.join()).toBe('blog > about.*,blog > about,blog.* > about.*,blog.* > about');
                expect(message.length).toBe(4);
                expect(trs[0].from.fullname).toBe('root.blog');
                expect(trs[0].to.fullname).toBe('root.about');
            });
        });
        it('Global blog -> about transition will be called when entering about from other substate', function () {
            var trs = [], message = [];
            mock.module(function ($stateProvider) {
                $stateProvider.state('blog', {
                    route: '/blog',
                    name: 'blog'
                }).state('blog.recent', {
                    route: '/recent',
                    name: 'blog.recent'
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
                        trs.push({
                            from: $from,
                            to: $to
                        });
                        message.push("blog.* > about.*");
                    }                ]).transition('blog', 'about.*', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        trs.push({
                            from: $from,
                            to: $to
                        });
                        message.push("blog > about.*");
                    }                ]).transition('blog.*', 'about', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        trs.push({
                            from: $from,
                            to: $to
                        });
                        message.push("blog.* > about");
                    }                ]).transition('blog', 'about', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        trs.push({
                            from: $from,
                            to: $to
                        });
                        message.push("blog > about");
                    }                ]);
            });
            mock.inject(function ($location, $route, $state) {
                $location.path('/blog/recent');
                scope.$digest();
                expect(trs.length).toBe(0);
                $location.path('/about');
                scope.$digest();
                expect(message.join()).toBe('blog > about.*,blog > about,blog.* > about.*,blog.* > about');
                expect(message.length).toBe(4);
                expect(trs[0].from.fullname).toBe('root.blog.recent');
                expect(trs[0].to.fullname).toBe('root.about');
            });
        });
        it('Global blog -> about transition will be called when entering substate about from other state', function () {
            var trs = [], message = [];
            mock.module(function ($stateProvider) {
                $stateProvider.state('blog', {
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
                }).transition('blog.*', 'about.*', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        trs.push({
                            from: $from,
                            to: $to
                        });
                        message.push("blog.* > about.*");
                    }                ]).transition('blog', 'about.*', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        trs.push({
                            from: $from,
                            to: $to
                        });
                        message.push("blog > about.*");
                    }                ]).transition('blog.*', 'about', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        trs.push({
                            from: $from,
                            to: $to
                        });
                        message.push("blog.* > about");
                    }                ]).transition('blog', 'about', [
                    '$from', 
                    '$to', 
                    function ($from, $to) {
                        trs.push({
                            from: $from,
                            to: $to
                        });
                        message.push("blog > about");
                    }                ]);
            });
            mock.inject(function ($location, $route, $state) {
                $location.path('/blog/recent');
                scope.$digest();
                expect(trs.length).toBe(0);
                $location.path('/about/cv');
                scope.$digest();
                expect(message.join()).toBe('blog > about.*,blog.* > about.*');
                expect(message.length).toBe(2);
                expect(trs[0].from.fullname).toBe('root.blog.recent');
                expect(trs[0].to.fullname).toBe('root.about.cv');
            });
        });
    });
});
