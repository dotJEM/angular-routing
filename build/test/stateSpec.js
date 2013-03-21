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
    function stringifyState(stateOrTransition) {
        var result = '(', children = [], targets = [];
        angular.forEach(stateOrTransition.children, function (child, name) {
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
    });
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
                expect(stringifyTransition($state.transition)).toBe('[](*[*+1](),blog[](*[about.*+1]()))');
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
                expect(stringifyTransition($state.transition)).toBe(expected.replace(/\s+/g, ''));
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
                expect(stringifyTransition($state.transition)).toBe(expected.replace(/\s+/g, ''));
            });
        });
    });
    describe("transition $routeChangeSuccess", function () {
        it('will broadcast $stateChangeSuccess that has the former state as argument', function () {
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
                    route: '/blog',
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
    });
});
