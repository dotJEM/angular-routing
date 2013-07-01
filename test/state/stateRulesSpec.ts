/// <reference path="../testcommon.ts" />

/// <reference path="../../src/state/stateRules.ts" />

describe('state.stateRules', function () {
    'use strict';
    var nui = typeof dotjem !== 'undefined' ? dotjem.ui : ui;
    var mod = angular.mock['module'];
    var inject = angular.mock.inject;
    beforeEach(mod('ui.routing', function () { return function () { }; }));

    describe('validateName', () => {
        it('accepts "valid" as name', function () {
            inject(function () {
                nui.routing.StateRules.validateName('valid');
            });
        });

        it('accepts "valid.sub" as name', function () {
            inject(function () {
                nui.routing.StateRules.validateName('valid.sub');
            });
        });

        it('accepts "valid.sub.child" as name', function () {
            inject(function () {
                nui.routing.StateRules.validateName('valid.sub.child');
            });
        });

        it('accepts "another" as name', function () {
            inject(function () {
                nui.routing.StateRules.validateName('another');
            });
        });

        it('accepts "another.sub" as name', function () {
            inject(function () {
                nui.routing.StateRules.validateName('another.sub');
            });
        });

        it('accepts "another.sub.child" as name', function () {
            inject(function () {
                nui.routing.StateRules.validateName('another.sub.child');
            });
        });

        it('rejects "" as name', function () {
            inject(function () {
                expect(function () { nui.routing.StateRules.validateName(''); }).toThrow("Invalid name: ''.");
            });
        });

        it('rejects ".!"#" as name', function () {
            inject(function () {
                expect(function () { nui.routing.StateRules.validateName('.!"#'); }).toThrow("Invalid name: '.!\"#'.");
            });
        });

        it('rejects "." as name', function () {
            inject(function () {
                expect(function () { nui.routing.StateRules.validateName('.'); }).toThrow("Invalid name: '.'.");
            });
        });

        it('rejects "almost.valid." as name', function () {
            inject(function () {
                expect(function () { nui.routing.StateRules.validateName('almost.valid.'); }).toThrow("Invalid name: 'almost.valid.'.");
            });
        });

        it('rejects ".almost.valid" as name', function () {
            inject(function () {
                expect(function () { nui.routing.StateRules.validateName('.almost.valid'); }).toThrow("Invalid name: '.almost.valid'.");
            });
        });
    });
});