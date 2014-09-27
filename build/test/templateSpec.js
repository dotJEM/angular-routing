/// <reference path="testcommon.ts" />
describe('$template', function () {
    'use strict';
    var mock = angular.mock;

    beforeEach(mock.module('dotjem.routing'));

    describe("with strings", function () {
        it('calls http when urls', function () {
            mock.inject(function ($template, $httpBackend) {
                $httpBackend.expect('GET', '/tpl/dummy.html').respond('<b>42</b>');

                var html;
                $template('/tpl/dummy.html').then(function (data) {
                    html = data;
                });
                $httpBackend.flush();

                expect(html).toEqual('<b>42</b>');
            });
        });

        it('returns raw when not url', function () {
            mock.inject(function ($template, $rootScope) {
                var html;
                $template('<b>42</b>').then(function (data) {
                    html = data;
                });
                $rootScope.$apply();

                expect(html).toEqual('<b>42</b>');
            });
        });
    });

    describe("with function", function () {
        it('calls function', function () {
            mock.inject(function ($template, $rootScope) {
                var html;
                $template(function () {
                    return '<b>42</b>';
                }).then(function (data) {
                    html = data;
                });
                $rootScope.$apply();

                expect(html).toEqual('<b>42</b>');
            });
        });

        it('function can get locals', function () {
            mock.inject(function ($template, $rootScope) {
                var html;
                $template(function ($number) {
                    return '<b>' + $number + '</b>';
                }, { $number: 42 }).then(function (data) {
                    html = data;
                });
                $rootScope.$apply();

                expect(html).toEqual('<b>42</b>');
            });
        });
    });

    describe("with objects", function () {
        it('calls http when defining url property', function () {
            mock.inject(function ($template, $httpBackend) {
                $httpBackend.expect('GET', '/tpl/dummy.html').respond('<b>42</b>');

                var html;
                $template({ url: '/tpl/dummy.html' }).then(function (data) {
                    html = data;
                });
                $httpBackend.flush();

                expect(html).toEqual('<b>42</b>');
            });
        });

        it('returns raw when defining html property', function () {
            mock.inject(function ($template, $rootScope) {
                var html;
                $template({ html: '/tpl/dummy.html' }).then(function (data) {
                    html = data;
                });
                $rootScope.$apply();

                expect(html).toEqual('/tpl/dummy.html');
            });
        });

        it('calls function when defining fn property', function () {
            mock.inject(function ($template, $rootScope) {
                var html;
                $template({ fn: function () {
                        return '<b>42</b>';
                    } }).then(function (data) {
                    html = data;
                });
                $rootScope.$apply();

                expect(html).toEqual('<b>42</b>');
            });
        });

        it('Url takes priority over others', function () {
            mock.inject(function ($template, $httpBackend) {
                $httpBackend.expect('GET', '/tpl/dummy.html').respond('Url');

                var html;
                $template({ url: '/tpl/dummy.html', html: 'Html', fn: function () {
                        return 'Function';
                    } }).then(function (data) {
                    html = data;
                });
                $httpBackend.flush();

                expect(html).toEqual('Url');
            });
        });

        it('Function takes priority over html', function () {
            mock.inject(function ($template, $rootScope) {
                var html;
                $template({ html: 'Html', fn: function () {
                        return 'Function';
                    } }).then(function (data) {
                    html = data;
                });
                $rootScope.$apply();

                expect(html).toEqual('Function');
            });
        });
    });
});
