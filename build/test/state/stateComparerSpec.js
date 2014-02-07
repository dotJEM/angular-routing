/// <reference path="../testcommon.ts" />
describe('state.stateComparer', function () {
    'use strict';

    //Note: This line below is to be able to run the test cases both on the build output as well
    //      as the raw source, this is because the solution is wrapped in a function on build.
    //      It is a bit of a mess though which I am not to fond of, but will have to do for now.
    var mod = angular.mock['module'];
    var inject = angular.mock.inject;
    beforeEach(mod('dotjem.routing', function () {
        return function () {
        };
    }));

    describe('', function () {
        it('', function () {
            inject(function ($view) {
            });
        });
    });
});
