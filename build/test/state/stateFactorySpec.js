/// <reference path="../testcommon.ts" />
describe('state.stateFactory', function () {
    'use strict';

    //Note: This line below is to be able to run the test cases both on the build output as well
    //      as the raw source, this is because the solution is wrapped in a function on build.
    //      It is a bit of a mess though which I am not to fond of, but will have to do for now.
    var mod = angular.mock['module'];

    //var inject = angular.mock.inject;
    beforeEach(mod('dotjem.routing'));

    var mock = { when: angular.noop };

    describe('createRoute', function () {
        it('_ + _ = _', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('', '')).toEqual('');
        });

        it('/ + _ = _', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('/', '')).toEqual('');
        });

        it('_ + / = _', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('', '/')).toEqual('');
        });

        it('/ + / = _', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('/', '/')).toEqual('');
        });

        it('/route + _ = /route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('/route', '')).toEqual('/route');
        });

        it('/route + / = /route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('/route', '/')).toEqual('/route');
        });

        it('_ + /route = /route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('', '/route')).toEqual('/route');
        });

        it('/ + /route = /route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('/', '/route')).toEqual('/route');
        });

        it('/route/ + _ = /route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('/route/', '')).toEqual('/route');
        });

        it('_ + /route/ = /route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('', '/route/')).toEqual('/route');
        });

        it('_ + route/ = /route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('', 'route/')).toEqual('/route');
        });

        it('route/ + _ = /route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('route/', '')).toEqual('/route');
        });

        it('_ + route = /route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('', 'route')).toEqual('/route');
        });

        it('/ + route = /route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('/', 'route')).toEqual('/route');
        });

        it('route + _ = /route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('route', '')).toEqual('/route');
        });

        it('route + / = /route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('route', '/')).toEqual('/route');
        });

        it('route + parent = /parent/route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('route', 'parent')).toEqual('/parent/route');
        });

        it('/route + parent = /parent/route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('/route', 'parent')).toEqual('/parent/route');
        });

        it('route + /parent = /parent/route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('route', '/parent')).toEqual('/parent/route');
        });

        it('/route + /parent = /parent/route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('/route', '/parent')).toEqual('/parent/route');
        });

        it('route/ + parent = /parent/route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('route/', 'parent')).toEqual('/parent/route');
        });

        it('route + parent/ = /parent/route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('route', 'parent/')).toEqual('/parent/route');
        });

        it('route/ + parent/ = /parent/route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('route/', 'parent/')).toEqual('/parent/route');
        });

        it('/route + parent/ = /parent/route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('/route', 'parent/')).toEqual('/parent/route');
        });

        it('route/ + /parent = /parent/route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('route/', '/parent')).toEqual('/parent/route');
        });

        it('route + /parent/ = /parent/route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('route', '/parent/')).toEqual('/parent/route');
        });

        it('/route/ + parent = /parent/route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('/route/', 'parent')).toEqual('/parent/route');
        });

        it('/route/ + /parent/ = /parent/route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('/route/', '/parent/')).toEqual('/parent/route');
        });

        it('/route/ + /parent/middle/ = /parent/middle/route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('/route/', '/parent/middle/')).toEqual('/parent/middle/route');
        });

        //Route Normalization where the user defines extra /'s
        it('/route/ + /parent//middle/ = /parent/middle/route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('/route/', '/parent//middle/')).toEqual('/parent/middle/route');
        });

        it('/route/ + /parent/middle/ = /parent/middle/route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('route', 'parent//middle')).toEqual('/parent/middle/route');
        });

        it('//route// + //parent////middle// = /parent/middle/route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('//route//', '//parent////middle//')).toEqual('/parent/middle/route');
        });

        it('//parent////middle////route// + _ = /parent/middle/route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('//parent////middle////route//', '')).toEqual('/parent/middle/route');
        });

        it('_ + //parent////middle////route// = /parent/middle/route', function () {
            spyOn(mock, 'when').andCallFake(angular.identity);

            var factory = new test.StateFactory(mock);
            expect(factory.createRoute('', '//parent////middle////route//')).toEqual('/parent/middle/route');
        });
    });
});
