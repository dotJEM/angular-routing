/// <reference path="testcommon.ts" />
describe('$routeProvider', function () {
    'use strict';
    var mock = angular.mock;
    var scope;
    beforeEach(mock.module('ui.routing', function () {
        return function ($rootScope) {
            scope = $rootScope;
        };
    }));
    describe("when", function () {
        it('matches first defined route', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book', {
                    message: "bookRoute"
                }).when('/Customer', {
                    message: "customerRoute"
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
            });
        });
        it('matches second defined route', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book', {
                    message: "bookRoute"
                }).when('/Customer', {
                    message: "customerRoute"
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Customer');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('customerRoute');
            });
        });
        it('matches no route', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book', {
                    message: "bookRoute"
                }).when('/Customer', {
                    message: "customerRoute"
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Fubar');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeUndefined();
            });
        });
        it('matches no route if different casing', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book', {
                    message: "bookRoute"
                }).when('/Customer', {
                    message: "customerRoute"
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/book');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeUndefined();
            });
        });
        it('matches first route with paramter', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/{id}', {
                    message: "bookRoute"
                }).when('/Customer/{id}', {
                    message: "customerRoute"
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/number80');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
                expect(next.params['id']).toBe('number80');
            });
        });
        it('matches second route with paramter', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/{id}', {
                    message: "bookRoute"
                }).when('/Customer/{id}', {
                    message: "customerRoute"
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Customer/number80');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('customerRoute');
                expect(next.params['id']).toBe('number80');
            });
        });
        it('matches first route with number paramter and converts to number', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/{num:id}', {
                    message: "bookRoute"
                }).when('/Customer/{num:id}', {
                    message: "customerRoute"
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/80');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
                expect(next.params['id']).toBe(80);
            });
        });
        it('matches second route with number paramter and converts to number', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/{num:id}', {
                    message: "bookRoute"
                }).when('/Customer/{num:id}', {
                    message: "customerRoute"
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Customer/80');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('customerRoute');
                expect(next.params['id']).toBe(80);
            });
        });
        it('matches no route when number parameter is invalid', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/{num:id}', {
                    message: "bookRoute"
                }).when('/Customer/{num:id}', {
                    message: "customerRoute"
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/hello90');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeUndefined();
            });
        });
        it('matches route when using regex parameter', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/{regex(^\\w{2,5}$):id}', {
                    message: "bookRoute"
                }).when('/Customer/{id}', {
                    message: "customerRoute"
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/what');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
                expect(next.params['id'].toString()).toBe("what");
            });
        });
        it('matches no route when regex parameter is invalid', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/{regex(^\\w{2,5}$):id}', {
                    message: "bookRoute"
                }).when('/Customer/{id}', {
                    message: "customerRoute"
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/whatup');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeUndefined();
            });
        });
        it('matches no route when parameter is invalid created with object', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/{regex( { "exp" : "^\\\\w{2,5}$", "flags": "i" } ):id}', {
                    message: "bookRoute"
                }).when('/Customer/{id}', {
                    message: "customerRoute"
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/what');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
                expect(next.params['id'].toString()).toBe("what");
            });
        });
        it('should be possible to overwrite a route', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book', {
                    message: "oldBookRoute"
                }).when('/Customer', {
                    message: "customerRoute"
                }).when('/Book', {
                    message: "bookRoute"
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
            });
        });
        it('should be possible to register same route with different parameter types a route', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/{num:param}', {
                    message: "numberBookRoute"
                }).when('/Book/{param}', {
                    message: "bookRoute"
                });
            });
            mock.inject(function ($route, $location) {
                var next;
                $location.path('/Book/10');
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('numberBookRoute');
                expect(next.params['param']).toBe(10);
                $location.path('/Book/Hello');
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
                expect(next.params['param']).toBe('Hello');
            });
        });
        it('normalize names', function () {
            var converterArgs;
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/:param1/:param2', {
                }).when('/Home/:param3/:param4', {
                }).when('/Rear/:param3/:param4', {
                });
            });
            mock.inject(function ($route, $location) {
                expect($route.routes['/Book/:param1/:param2']).toBeUndefined();
                expect($route.routes['/Book/$0/$1']).toBeDefined();
                expect($route.routes['/Home/:param3/:param4']).toBeUndefined();
                expect($route.routes['/Home/$0/$1']).toBeDefined();
                expect($route.routes['/Rear/:param3/:param4']).toBeUndefined();
                expect($route.routes['/Home/$0/$1']).toBeDefined();
                expect(Object.keys($route.routes).length).toBe(3);
            });
        });
        it('normalized names allow for overwriting routes', function () {
            var converterArgs;
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/:param1/:param2', {
                }).when('/Book/:param3/:param4', {
                });
            });
            mock.inject(function ($route, $location) {
                expect($route.routes['/Book/:param1/:param2']).toBeUndefined();
                expect($route.routes['/Book/$0/$1']).toBeDefined();
                expect(Object.keys($route.routes).length).toBe(1);
            });
        });
        it('different converters can be used to seperate routes', function () {
            var converterArgs;
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/{num:param1}/numbers', {
                }).when('/Book/{param1}/others', {
                });
            });
            mock.inject(function ($route, $location) {
                expect($route.routes['/Book/$0:num/numbers']).toBeDefined();
                expect($route.routes['/Book/$0/others']).toBeDefined();
                expect(Object.keys($route.routes).length).toBe(2);
            });
        });
    });
    describe("decorate", function () {
        it('converts message paramter into template parameter', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book', {
                    message: "bookRoute"
                }).when('/Customer', {
                    message: "customerRoute"
                }).decorate('template', function () {
                    this.decoratedMessage = this.message;
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.decoratedMessage).toBe('bookRoute');
            });
        });
    });
    describe("convert", function () {
        it('matches route when custom parameter starts with a', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/{custom:param}', {
                    message: "bookRoute"
                }).when('/Customer/{custom:param}', {
                    message: "customerRoute"
                }).convert('custom', function () {
                    return function (param) {
                        return param[0] == 'a';
                    };
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/aBook');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
            });
        });
        it('matches no route when custom parameter starts with b', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/{custom:param}', {
                    message: "bookRoute"
                }).when('/Customer/{custom:param}', {
                    message: "customerRoute"
                }).convert('custom', function () {
                    return function (param) {
                        if(param.charAt(0) === 'a') {
                            return true;
                        }
                        return false;
                    };
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/bBook');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeUndefined();
            });
        });
        it('matches route when custom parameter contains pattern sub', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/{contains(sub):param}', {
                    message: "bookRoute"
                }).when('/Customer/{contains(sub):param}', {
                    message: "customerRoute"
                }).convert('contains', function (substring) {
                    return function (param) {
                        if(param.search(substring) != -1) {
                            return true;
                        }
                        return false;
                    };
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/Booksubstore');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
            });
        });
        it('matches no route when custom parameter contains pattern fubar', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/{contains(fubar):param}', {
                    message: "bookRoute"
                }).when('/Customer/{contains(fubar):param}', {
                    message: "customerRoute"
                }).convert('contains', function (substring) {
                    return function (param) {
                        if(param.search(substring) != -1) {
                            return true;
                        }
                        return false;
                    };
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/Booksubstore');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeUndefined();
            });
        });
        it('matches no route when custom parameter contains pattern fubar', function () {
            var converterArgs;
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/{custom({"name":"John Doe", "age": 42}):param}', {
                    message: "bookRoute"
                }).convert('custom', function (args) {
                    converterArgs = args;
                    return function (param) {
                        return true;
                    };
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/Book/Something');
                scope.$digest();
                expect(converterArgs.name).toBe('John Doe');
                expect(converterArgs.age).toBe(42);
            });
        });
    });
    describe("otherwise", function () {
        // Tested in legacy specs for now.
            });
    describe("ignoreCase", function () {
        it('matches an uppercase route whit an lowercase location', function () {
            var converterArgs;
            mock.module(function ($routeProvider) {
                $routeProvider.when('/BOOK', {
                    message: "bookRoute"
                }).ignoreCase();
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/book');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
            });
        });
    });
});
