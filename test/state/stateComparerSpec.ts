/// <reference path="../testcommon.ts" />

describe('state.stateComparer', function () {
    'use strict';

    //Note: This line below is to be able to run the test cases both on the build output as well
    //      as the raw source, this is because the solution is wrapped in a function on build.
    //      It is a bit of a mess though which I am not to fond of, but will have to do for now.
    var mod = angular.mock['module'];
    var inject = angular.mock.inject;
    beforeEach(mod('dotjem.routing', function () { return function () { }; }));

    describe('path', function () {
        it('different trees', function () {
            var comparer = new test.StateComparer();
            var root = { fullname: '$root' };

            var result = comparer.path(
                { fullname: '$root.left.branch', parent: { fullname: '$root.left', parent: root } },
                { fullname: '$root.right.branch', parent: { fullname: '$root.right', parent: root } },
                {},
                {});

            var changed = result.changed;
            expect(changed[0]).toHaveProperties({ activate: false, name: '$root.left.branch', params: {}});
            expect(changed[1]).toHaveProperties({ activate: false, name: '$root.left', params: {} });
            expect(changed[2]).toHaveProperties({ activate: true, name: '$root.right', params: {} });
            expect(changed[3]).toHaveProperties({ activate: true, name: '$root.right.branch', params: {} });
        });

        it('different branches unchanged holds common ancestors', function () {
            var comparer = new test.StateComparer();
            var root = { fullname: '$root' };
            var branch = { fullname: '$root.branch' };

            var result = comparer.path(
                { fullname: '$root.branch.left', parent: branch },
                { fullname: '$root.branch.right', parent: branch },
                {},
                {});
            
            expect(result.unchanged[0]).toHaveProperties({ activate: false, name: '$root.branch', params: {} });
        });

        it('different branches', function () {
            var comparer = new test.StateComparer();
            var root = { fullname: '$root' };
            var branch = { fullname: '$root.branch' };

            var result = comparer.path(
                { fullname: '$root.branch.left', parent: branch },
                { fullname: '$root.branch.right', parent: branch },
                {},
                {});

            var changed = result.changed;
            expect(changed[0]).toHaveProperties({ activate: false, name: '$root.branch.left', params: {} });
            expect(changed[1]).toHaveProperties({ activate: true, name: '$root.branch.right', params: {} });
        });

        it('different branches with changed parameter on common ancestor', function () {
            var comparer = new test.StateComparer();
            var root = { fullname: '$root' };
            var branch = { fullname: '$root.branch', route: { params: { foo: '' } } };

            var result = comparer.path(
                { fullname: '$root.branch.left', parent: branch },
                { fullname: '$root.branch.right', parent: branch },
                { foo: 1 },
                { foo: 2 });

            var changed = result.changed;
            expect(changed[0]).toHaveProperties({ activate: false, name: '$root.branch.left', params: {} });
            expect(changed[1]).toHaveProperties({ activate: false, name: '$root.branch', params: { foo: 1 } });
            expect(changed[2]).toHaveProperties({ activate: true, name: '$root.branch', params: { foo: 2 } });
            expect(changed[3]).toHaveProperties({ activate: true, name: '$root.branch.right', params: {} });
        });

        it('different branches with unchanged parameter on common ancestor', function () {
            var comparer = new test.StateComparer();
            var root = { fullname: '$root' };
            var branch = { fullname: '$root.branch', route: { params: { foo: '' } } };

            var result = comparer.path(
                { fullname: '$root.branch.left', parent: branch },
                { fullname: '$root.branch.right', parent: branch },
                { foo: 1 },
                { foo: 1 });

            var changed = result.changed;
            expect(changed[0]).toHaveProperties({ activate: false, name: '$root.branch.left', params: {} });
            expect(changed[1]).toHaveProperties({ activate: true, name: '$root.branch.right', params: {} });
        });
    });
});