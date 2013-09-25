/// <reference path="testcommon.ts" />
describe('$routeProvider', function () {
    'use strict';
    var mock = angular.mock;
    var scope;
    beforeEach(mock.module('dotjem.routing', function () {
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
        it('catch all parameters', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/{*url}', {
                    message: "catchAll"
                });
            });
            mock.inject(function ($route, $location) {
                spyOn($location, 'path').andReturn('/route/with/long/path');
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('catchAll');
                expect(next.params.url).toBe('route/with/long/path');
            });
        });
        it('can define more specific routes before catch all', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/{*url}', {
                    message: "bookRoute"
                }).when('/{*url}', {
                    message: "catchAll"
                });
            });
            mock.inject(function ($route, $location) {
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                $location.url('/Book/with/catch/all');
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
                expect(next.params.url).toBe('with/catch/all');
                $location.url('/route/with/long/path');
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('catchAll');
                expect(next.params.url).toBe('route/with/long/path');
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
        it('can use catch all with parameters', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.when('/Book/{contains(catch):*param}', {
                    message: "bookRoute"
                }).when('/Customer/{contains(catch):*param}', {
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
                var next;
                scope.$on('$routeChangeSuccess', function (self, n) {
                    next = n;
                });
                $location.url('/Book/with/catch/all');
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('bookRoute');
                expect(next.params.param).toBe('with/catch/all');
                $location.url('/Customer/with/catch/all');
                scope.$digest();
                expect(next).toBeDefined();
                expect(next.message).toBe('customerRoute');
                expect(next.params.param).toBe('with/catch/all');
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
                $routeProvider.ignoreCase().when('/BOOK', {
                    message: "bookRoute"
                });
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
    describe("format", function () {
        it('without parameters returns simple route', function () {
            mock.inject(function ($route) {
                expect($route.format('/look')).toBe('/look');
            });
        });
        it('with simple parameters returns formated route', function () {
            mock.inject(function ($route) {
                expect($route.format('/look/:one', {
                    one: 1
                })).toBe('/look/1');
            });
        });
        it('with converter parameters returns formated route', function () {
            mock.inject(function ($route) {
                expect($route.format('/look/{regex([0-9]*):one}', {
                    one: 1
                })).toBe('/look/1');
            });
        });
        it('regex converter throws error when values does not match', function () {
            //TODO: Built in regex should check for valid parameters.
            mock.inject(function ($route) {
                expect(function () {
                    $route.format('/look/{regex([0-9]+):one}', {
                        one: 'invalid'
                    });
                }).toThrow();
            });
        });
        it('custom converter can define formatting', function () {
            mock.module(function ($routeProvider) {
                $routeProvider.convert('custom', function () {
                    return {
                        parse: function (param) {
                            return true;
                        },
                        format: function (value) {
                            switch(value) {
                                case 1:
                                    return "One";
                                case 2:
                                    return "Two";
                                case 3:
                                    return "Three";
                            }
                            throw Error("Invalid parameter value");
                        }
                    };
                });
            });
            //TODO: Built in regex should check for valid parameters.
            mock.inject(function ($route) {
                expect($route.format('/look/{custom:one}', {
                    one: 1
                })).toBe('/look/One');
                expect($route.format('/look/{custom:one}', {
                    one: 2
                })).toBe('/look/Two');
                expect($route.format('/look/{custom:one}', {
                    one: 3
                })).toBe('/look/Three');
                expect(function () {
                    $route.format('/look/{custom:one}', {
                        one: 4
                    });
                }).toThrow("Invalid parameter value");
            });
        });
    });
    describe("change", function () {
        var location;
        beforeEach(mock.module('dotjem.routing', function ($routeProvider) {
            return function ($rootScope, $location) {
                scope = $rootScope;
                location = $location;
            };
        }));
        function goto(target) {
            location.path(target);
            scope.$digest();
        }
        it('without params changes location', function () {
            var converterArgs;
            mock.module(function ($routeProvider) {
                $routeProvider.when('/book', {
                    message: "bookRoute"
                }).when('/look', {
                    message: "lookRoute"
                });
            });
            mock.inject(function ($route, $location) {
                goto('/book');
                expect($route.current.message).toBe('bookRoute');
                $route.change({
                    route: '/look'
                });
                scope.$digest();
                expect($route.current.message).toBe('lookRoute');
                expect(location.path()).toBe('/look');
            });
        });
        it('with params changes location', function () {
            var converterArgs;
            mock.module(function ($routeProvider) {
                $routeProvider.when('/book', {
                    message: "bookRoute"
                }).when('/book/:id', {
                    message: "bookRouteWithId"
                }).when('/look', {
                    message: "lookRoute"
                }).when('/look/:id', {
                    message: "lookRouteWithId"
                });
            });
            mock.inject(function ($route, $location) {
                goto('/book');
                expect($route.current.message).toBe('bookRoute');
                $route.change({
                    route: '/look/:id',
                    params: {
                        id: 42
                    }
                });
                scope.$digest();
                expect($route.current.message).toBe('lookRouteWithId');
                expect(location.path()).toBe('/look/42');
            });
        });
        it('with params with {x} notation', function () {
            var converterArgs;
            mock.module(function ($routeProvider) {
                $routeProvider.when('/book', {
                    message: "bookRoute"
                }).when('/book/{id}', {
                    message: "bookRouteWithId"
                }).when('/look', {
                    message: "lookRoute"
                }).when('/look/{id}', {
                    message: "lookRouteWithId"
                });
            });
            mock.inject(function ($route, $location) {
                goto('/book');
                expect($route.current.message).toBe('bookRoute');
                $route.change({
                    route: '/look/{id}',
                    params: {
                        id: 42
                    }
                });
                scope.$digest();
                expect($route.current.message).toBe('lookRouteWithId');
                expect(location.path()).toBe('/look/42');
            });
        });
    });
});
