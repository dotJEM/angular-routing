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
            expect(changed[0]).toHaveProperties({ active: false, name: '$root.left.branch', params: {}});
            expect(changed[1]).toHaveProperties({ active: false, name: '$root.left', params: {} });
            expect(changed[2]).toHaveProperties({ active: true, name: '$root.right', params: {} });
            expect(changed[3]).toHaveProperties({ active: true, name: '$root.right.branch', params: {} });
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
            
            expect(result.unchanged[0]).toHaveProperties(
                { active: true, changed: false, name: '$root.branch', params: {} });
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

            expect(result.activated[0]).toHaveProperties({ active: true, name: '$root.branch.right', params: {} });
            expect(result.deactivated[0]).toHaveProperties({ active: false, name: '$root.branch.left', params: {} });
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
            expect(changed[0]).toHaveProperties({ active: false, name: '$root.branch.left', params: {} });
            expect(changed[1]).toHaveProperties({ active: true, name: '$root.branch.right', params: {} });
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
            expect(changed[0]).toHaveProperties({ active: false, name: '$root.branch.left', params: {} });
            expect(changed[1]).toHaveProperties({ active: false, name: '$root.branch', params: { foo: 1 } });
            expect(changed[2]).toHaveProperties({ active: true, name: '$root.branch', params: { foo: 2 } });
            expect(changed[3]).toHaveProperties({ active: true, name: '$root.branch.right', params: {} });
        });

        it('different branches with changed parameter on common ancestor without reloading on parameter changes', function () {
            var comparer = new test.StateComparer();
            var root = { fullname: '$root' };
            var branch = { fullname: '$root.branch', reloadOnOptional: false, route: { params: { foo: '' } } };

            var result = comparer.path(
                { fullname: '$root.branch.left', parent: branch },
                { fullname: '$root.branch.right', parent: branch },
                { foo: 1, bar: 'bob' },
                { foo: 1, bar: 'mar' });

            var changed = result.changed;
            expect(changed[0]).toHaveProperties({ active: false, name: '$root.branch.left', params: {} });
            expect(changed[1]).toHaveProperties({ active: true, name: '$root.branch.right', params: {} });
        });

        it('different branches with changed parameter on common ancestor without reloading on parameter changes', function () {
            var comparer = new test.StateComparer();
            var root = { fullname: '$root' };
            var branch = { fullname: '$root.branch', reloadOnOptional: true, route: { params: { foo: '' } } };

            var result = comparer.path(
                { fullname: '$root.branch.left', parent: branch },
                { fullname: '$root.branch.right', parent: branch },
                { foo: 1, bar: 'bob', $search: { bar: 'bob' } },
                { foo: 1, bar: 'mar', $search: { bar: 'mar' }  });

            var changed = result.changed;
            expect(changed[0]).toHaveProperties({ active: false, name: '$root.branch.left', params: {} });
            expect(changed[1]).toHaveProperties({ active: false, name: '$root.branch', params: { foo: 1 } });
            expect(changed[2]).toHaveProperties({ active: true, name: '$root.branch', params: { foo: 1 } });
            expect(changed[3]).toHaveProperties({ active: true, name: '$root.branch.right', params: {} });
        });

        it('parameter changes sets paramChanges true', function () {
            var comparer = new test.StateComparer();
            var root = { fullname: '$root' };
            var branch = { fullname: '$root.branch', reloadOnOptional: false, route: { params: { foo: '' } } };

            var result = comparer.path(
                { fullname: '$root.branch.right', parent: branch },
                { fullname: '$root.branch.right', parent: branch },
                { foo: 1 },
                { foo: 2 });

            var changed = result.changed;
            expect(result.paramChanges).toBe(true);
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
            expect(changed[0]).toHaveProperties({ active: false, name: '$root.branch.left', params: {} });
            expect(changed[1]).toHaveProperties({ active: true, name: '$root.branch.right', params: {} });
        });

        it('applying force gives changes from the fourced state', function () {
            var comparer = new test.StateComparer();
            var root = { fullname: '$root' };
            var branch = { fullname: '$root.branch', route: { params: { foo: '' } } };

            var result = comparer.path(
                { fullname: '$root.branch.left', parent: branch },
                { fullname: '$root.branch.left', parent: branch },
                { foo: 1 },
                { foo: 1 },
                { force: '$root.branch' });

            var changed = result.changed;
            expect(changed[0]).toHaveProperties({ active: false, name: '$root.branch.left', params: {} });
            expect(changed[1]).toHaveProperties({ active: false, name: '$root.branch', params: { foo: 1 } });
        });

        it('applying force in different branches gives changes from the fourced state', function () {
            var comparer = new test.StateComparer();
            var root = { fullname: '$root' };
            var branch = { fullname: '$root.branch', reloadOnOptional: true, route: { params: { foo: '' } } };

            var result = comparer.path(
                { fullname: '$root.branch.left', parent: branch },
                { fullname: '$root.branch.right', parent: branch },
                { foo: 1, search: 'foo' },
                { foo: 1, search: 'bar' },
                { force: '$root.branch' });

            var changed = result.changed;
            expect(changed[0]).toHaveProperties({ active: false, name: '$root.branch.left', params: {} });
            expect(changed[1]).toHaveProperties({ active: false, name: '$root.branch', params: { foo: 1 } });
            expect(changed[2]).toHaveProperties({ active: true, name: '$root.branch', params: { foo: 1 } });
            expect(changed[3]).toHaveProperties({ active: true, name: '$root.branch.right', params: {} });
        });

        it('applying force overrules reloadOnOptional', function () {
            var comparer = new test.StateComparer();
            var root = { fullname: '$root' };
            var branch = { fullname: '$root.branch', reloadOnOptional: false, route: { params: { foo: '' } } };

            var result = comparer.path(
                { fullname: '$root.branch.left', parent: branch },
                { fullname: '$root.branch.right', parent: branch },
                { foo: 1 },
                { foo: 1 },
                { force: '$root.branch' });

            var changed = result.changed;
            expect(changed[0]).toHaveProperties({ active: false, name: '$root.branch.left', params: {} });
            expect(changed[1]).toHaveProperties({ active: false, name: '$root.branch', params: { foo: 1 } });
            expect(changed[2]).toHaveProperties({ active: true, name: '$root.branch', params: { foo: 1 } });
            expect(changed[3]).toHaveProperties({ active: true, name: '$root.branch.right', params: {} });
        });

        it('provides leaf information when we navigate up', function () {
            var comparer = new test.StateComparer();
            var root = { fullname: '$root' };
            var branch = { fullname: '$root.branch' };

            var result = comparer.path(
                { fullname: '$root.branch.left', parent: branch },
                branch,
                { },
                { });

            var changed = result.changed;
            expect(result.changed.length).toBe(1);
            expect(result.unchanged.length).toBe(1);
            expect(result.deactivated[0]).toHaveProperties({ active: false, name: '$root.branch.left', params: {} });
            expect(result.unchanged[0]).toHaveProperties({ active: true, changed: false, name: '$root.branch', isLeaf: true });
        });
    });




});