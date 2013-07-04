/// <reference path="../testcommon.ts" />

'use strict';

describe('state.state', function () {
    'use strict';

    //Note: This line below is to be able to run the test cases both on the build output as well
    //      as the raw source, this is because the solution is wrapped in a function on build.
    //      It is a bit of a mess though which I am not to fond of, but will have to do for now.
    var nui = typeof dotjem !== 'undefined' ? dotjem.ui : ui;
    var mod = angular.mock['module'];
    var inject = angular.mock.inject;
    beforeEach(mod('ui.routing', function () { return function () { }; }));

    describe('', () => {
        it('', function () {



            inject(function ($view: ui.routing.IViewService) {

            });
        });
    });
});