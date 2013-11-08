/// <reference path="testcommon.ts" />
describe('$view', function () {
    'use strict';
    var mock = angular.mock;
    var template, scope;
    beforeEach(mock.module('dotjem.routing', function () {
        return function ($template, $rootScope, $view) {
            template = $template;
            scope = $rootScope;
            spyOn(template, 'get').andCallFake(function (value) {
                return value.html;
            });
        };
    }));
    describe("setOrUpdate", function () {
        it('saves initial view state', function () {
            mock.inject(function ($view) {
                $view.update("name", {
                    html: "template"
                });
                var view = $view.get('name');
                expect(view.template).toBe("template");
                expect(view.version).toBe(0);
            });
        });
        it('updates view state and increments version', function () {
            mock.inject(function ($view) {
                $view.update("name", {
                    html: "fubar"
                });
                $view.update("name", {
                    html: "template"
                });
                var view = $view.get('name');
                expect(view.template).toBe("template");
                expect(view.version).toBe(1);
            });
        });
        it('cleared view gets reinitialized', function () {
            mock.inject(function ($view) {
                $view.update("name", {
                    html: "fubar"
                });
                $view.clear("name");
                $view.update("name", {
                    html: "template"
                });
                var view = $view.get('name');
                expect(view.template).toBe("template");
                expect(view.version).toBe(0);
            });
        });
        it('raises $viewUpdate with viewName', function () {
            mock.inject(function ($view) {
                var spy = spyOn(scope, '$broadcast');
                $view.update("name", {
                    html: "fubar"
                });
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args).toEqual([
                    '$viewUpdate', 
                    "name"
                ]);
                $view.update("name", {
                    html: "template"
                });
                expect(spy.callCount).toBe(2);
                expect(spy.mostRecentCall.args).toEqual([
                    '$viewUpdate', 
                    "name"
                ]);
            });
        });
        it('raises $viewUpdate with viewName for each view', function () {
            mock.inject(function ($view) {
                var spy = spyOn(scope, '$broadcast');
                $view.update("root", {
                    html: "fubar"
                });
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args).toEqual([
                    '$viewUpdate', 
                    "root"
                ]);
                $view.update("sub", {
                    html: "template"
                });
                expect(spy.callCount).toBe(2);
                expect(spy.mostRecentCall.args).toEqual([
                    '$viewUpdate', 
                    "sub"
                ]);
            });
        });
        it('raises $viewRefresh when sticky tag matches', function () {
            mock.inject(function ($view) {
                var spy = spyOn(scope, '$broadcast');
                $view.update("root", {
                    html: "fubar"
                }, null, null, "sticky");
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args).toEqual([
                    '$viewUpdate', 
                    "root"
                ]);
                $view.update("root", {
                    html: "template"
                }, null, null, "sticky");
                expect(spy.callCount).toBe(2);
                expect(spy.mostRecentCall.args).toEqual([
                    '$viewRefresh', 
                    "root", 
                    {
                        $locals: null,
                        sticky: "sticky"
                    }
                ]);
            });
        });
        it('raises $viewUpdate when sticky tag differs', function () {
            mock.inject(function ($view) {
                var spy = spyOn(scope, '$broadcast');
                $view.update("root", {
                    html: "fubar"
                }, null, null, "sticky");
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args).toEqual([
                    '$viewUpdate', 
                    "root"
                ]);
                $view.update("root", {
                    html: "template"
                }, null, null, "sticky2");
                expect(spy.callCount).toBe(2);
                expect(spy.mostRecentCall.args).toEqual([
                    '$viewUpdate', 
                    "root"
                ]);
            });
        });
        it('raises $viewUpdate when sticky tag is undefined', function () {
            mock.inject(function ($view) {
                var spy = spyOn(scope, '$broadcast');
                $view.update("root", {
                    html: "fubar"
                }, null, null, undefined);
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args).toEqual([
                    '$viewUpdate', 
                    "root"
                ]);
                $view.update("root", {
                    html: "template"
                }, null, null, undefined);
                expect(spy.callCount).toBe(2);
                expect(spy.mostRecentCall.args).toEqual([
                    '$viewUpdate', 
                    "root"
                ]);
            });
        });
    });
    describe("refresh", function () {
        it('raises $viewRefresh with provided data', function () {
            mock.inject(function ($view) {
                $view.update('root', {
                    html: "fubar"
                });
                var spy = spyOn(scope, '$broadcast');
                $view.refresh("root", {
                    stuff: "fubar"
                });
                expect(spy.mostRecentCall.args).toEqual([
                    '$viewRefresh', 
                    "root", 
                    {
                        $locals: undefined,
                        stuff: "fubar"
                    }
                ]);
            });
        });
        it('raises $viewRefresh and preserves locals', function () {
            mock.inject(function ($view) {
                $view.update('root', {
                    html: "fubar"
                }, '', {
                    local: "hello"
                });
                var spy = spyOn(scope, '$broadcast');
                $view.refresh("root", {
                    stuff: "fubar"
                });
                expect(spy.mostRecentCall.args).toEqual([
                    '$viewRefresh', 
                    "root", 
                    {
                        $locals: {
                            local: "hello"
                        },
                        stuff: "fubar"
                    }
                ]);
            });
        });
    });
    describe("setIfAbsent", function () {
        it('saves initial view state', function () {
            mock.inject(function ($view) {
                $view.create("name", {
                    html: "template"
                });
                var view = $view.get('name');
                expect(view.template).toBe("template");
                expect(view.version).toBe(0);
            });
        });
        it('does not update view state if it already exists', function () {
            mock.inject(function ($view) {
                $view.create("name", {
                    html: "template"
                });
                $view.create("name", {
                    html: "fubar"
                });
                var view = $view.get('name');
                expect(view.template).toBe("template");
                expect(view.version).toBe(0);
            });
        });
        it('updates view state if it was cleared', function () {
            mock.inject(function ($view) {
                $view.create("name", {
                    html: "fubar"
                });
                $view.clear("name");
                $view.create("name", {
                    html: "template"
                });
                var view = $view.get('name');
                expect(view.template).toBe("template");
                expect(view.version).toBe(0);
            });
        });
        it('raises $viewUpdated with viewName only for first call', function () {
            mock.inject(function ($view) {
                var spy = spyOn(scope, '$broadcast');
                $view.create("name", {
                    html: "fubar"
                });
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args[1]).toBe("name");
                $view.create("name", {
                    html: "template"
                });
                expect(spy.callCount).toBe(1);
            });
        });
        it('raises $viewUpdated with viewName for each view', function () {
            mock.inject(function ($view) {
                var spy = spyOn(scope, '$broadcast');
                $view.create("root", {
                    html: "fubar"
                });
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args[1]).toBe("root");
                $view.create("sub", {
                    html: "template"
                });
                expect(spy.callCount).toBe(2);
                expect(spy.mostRecentCall.args[1]).toBe("sub");
            });
        });
    });
    describe("clear", function () {
        it('no parameters clears state', function () {
            mock.inject(function ($view) {
                $view.create("root", {
                    html: "root template"
                });
                $view.create("sub1", {
                    html: "sub1 template"
                });
                $view.create("sub2", {
                    html: "sub2 template"
                });
                $view.clear();
                expect($view.get("root")).toBeUndefined();
                expect($view.get("sub1")).toBeUndefined();
                expect($view.get("sub2")).toBeUndefined();
            });
        });
        it('with parameters will set view to undefined (delete it)', function () {
            mock.inject(function ($view) {
                $view.create("root", {
                    html: "root template"
                });
                $view.create("sub1", {
                    html: "sub1 template"
                });
                $view.create("sub2", {
                    html: "sub2 template"
                });
                $view.clear("sub2");
                expect($view.get("root")).toBeDefined();
                expect($view.get("sub1")).toBeDefined();
                expect($view.get("sub2")).toBeUndefined();
            });
        });
        it('clear raises $viewUpdated with viewName for cleared view', function () {
            mock.inject(function ($view) {
                $view.create("root", {
                    html: "root template"
                });
                $view.create("sub1", {
                    html: "sub1 template"
                });
                $view.create("sub2", {
                    html: "sub2 template"
                });
                var spy = spyOn(scope, '$broadcast');
                $view.clear("sub1");
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args[1]).toBe("sub1");
                $view.clear("sub2");
                expect(spy.callCount).toBe(2);
                expect(spy.mostRecentCall.args[1]).toBe("sub2");
            });
        });
    });
    describe("$viewUpdate", function () {
        it('raised when setOrUpdate is called', function () {
            mock.inject(function ($view) {
                var spy = spyOn(scope, '$broadcast');
                $view.update("root", {
                    html: "root template"
                });
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args[1]).toBe("root");
                expect(spy.mostRecentCall.args[0]).toBe("$viewUpdate");
                $view.update("root", {
                    html: "sub1 template"
                });
                expect(spy.callCount).toBe(2);
                expect(spy.mostRecentCall.args[1]).toBe("root");
                expect(spy.mostRecentCall.args[0]).toBe("$viewUpdate");
                $view.update("root", {
                    html: "sub2 template"
                });
                expect(spy.callCount).toBe(3);
                expect(spy.mostRecentCall.args[1]).toBe("root");
                expect(spy.mostRecentCall.args[0]).toBe("$viewUpdate");
            });
        });
        it('raised only first time when setIfAbsent is called with same name', function () {
            mock.inject(function ($view) {
                var spy = spyOn(scope, '$broadcast');
                $view.create("root", {
                    html: "root template"
                });
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args[1]).toBe("root");
                expect(spy.mostRecentCall.args[0]).toBe("$viewUpdate");
                $view.create("root", {
                    html: "root template"
                });
                expect(spy.callCount).toBe(1);
                $view.create("root", {
                    html: "root template"
                });
                expect(spy.callCount).toBe(1);
            });
        });
        it('raised on clear with name', function () {
            mock.inject(function ($view) {
                $view.update("view1", {
                    html: "view1 template"
                });
                $view.update("view2", {
                    html: "view2 template"
                });
                $view.update("view3", {
                    html: "view3 template"
                });
                var spy = spyOn(scope, '$broadcast');
                $view.clear("view1");
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args[1]).toBe("view1");
                expect(spy.mostRecentCall.args[0]).toBe("$viewUpdate");
                $view.clear("view2");
                expect(spy.callCount).toBe(2);
                expect(spy.mostRecentCall.args[1]).toBe("view2");
                expect(spy.mostRecentCall.args[0]).toBe("$viewUpdate");
                $view.clear("view3");
                expect(spy.callCount).toBe(3);
                expect(spy.mostRecentCall.args[1]).toBe("view3");
                expect(spy.mostRecentCall.args[0]).toBe("$viewUpdate");
            });
        });
    });
    describe("beginUpdate", function () {
        it('setIfAbsent does not overwrite even during transactional update', function () {
            mock.inject(function ($view) {
                var trx = $view.beginUpdate();
                $view.create("root", {
                    html: "root"
                });
                $view.create("root", {
                    html: "fubar"
                });
                trx.commit();
                expect($view.get("root").template).toBe("root");
            });
        });
        it('get returns old state untill commit is called', function () {
            mock.inject(function ($view) {
                var trx = $view.beginUpdate();
                $view.create("root", {
                    html: "root"
                });
                $view.create("root", {
                    html: "fubar"
                });
                expect($view.get("root")).toBeUndefined();
                trx.commit();
                expect($view.get("root").template).toBe("root");
            });
        });
        it('is not raised until after commit during transactional updates', function () {
            mock.inject(function ($view) {
                var spy = spyOn(scope, '$broadcast');
                var trx = $view.beginUpdate();
                $view.update("view1", {
                    html: "view1 template"
                });
                $view.update("view2", {
                    html: "view2 template"
                });
                $view.update("view3", {
                    html: "view3 template"
                });
                expect(spy.callCount).toBe(0);
                trx.commit();
                expect(spy.callCount).toBe(3);
                expect(spy.calls[0].args[1]).toBe('view1');
                expect(spy.calls[1].args[1]).toBe('view2');
                expect(spy.calls[2].args[1]).toBe('view3');
            });
        });
        it('is only raised ones pr name after commit during transactional updates', function () {
            mock.inject(function ($view) {
                var spy = spyOn(scope, '$broadcast');
                var trx = $view.beginUpdate();
                $view.update("view1", {
                    html: "view1 template"
                });
                $view.update("view2", {
                    html: "view2 template"
                });
                $view.update("view3", {
                    html: "view3 template"
                });
                $view.update("view1", {
                    html: "view1 template"
                });
                $view.update("view2", {
                    html: "view2 template"
                });
                $view.update("view3", {
                    html: "view3 template"
                });
                expect(spy.callCount).toBe(0);
                trx.commit();
                expect(spy.callCount).toBe(3);
                expect(spy.calls[0].args[1]).toBe('view1');
                expect(spy.calls[1].args[1]).toBe('view2');
                expect(spy.calls[2].args[1]).toBe('view3');
            });
        });
        it('is not raised after cancel during transactional updates', function () {
            mock.inject(function ($view) {
                var spy = spyOn(scope, '$broadcast');
                var trx = $view.beginUpdate();
                $view.update("view1", {
                    html: "view1 template"
                });
                $view.update("view2", {
                    html: "view2 template"
                });
                $view.update("view3", {
                    html: "view3 template"
                });
                expect(spy.callCount).toBe(0);
                trx.cancel();
                expect(spy.callCount).toBe(1);
                expect(spy.calls[0].args[0]).toBe('$viewPrep');
            });
        });
        it('clear causes viet to be cleared after commit', function () {
            mock.inject(function ($view) {
                $view.update("root", {
                    html: "root"
                });
                var trx = $view.beginUpdate();
                $view.clear("root");
                expect($view.get("root")).toBeDefined();
                trx.commit();
                expect($view.get("root")).toBeUndefined();
            });
        });
        it('clear causes viet to be cleared after commit', function () {
            mock.inject(function ($view) {
                $view.update("root", {
                    html: "root"
                });
                var spy = spyOn(scope, '$broadcast');
                var trx = $view.beginUpdate();
                $view.refresh("root", {
                    html: "custom data"
                });
                expect(spy.callCount).toBe(0);
                trx.commit();
                expect(spy.callCount).toBe(1);
                expect(spy.calls[0].args[0]).toBe('$viewRefresh');
                expect(spy.calls[0].args[1]).toBe('root');
            });
        });
        it('pending returns changes about to happen.', function () {
            mock.inject(function ($view) {
                var trx = $view.beginUpdate();
                $view.create("view1", {
                    html: "fubar"
                });
                $view.update("view2", {
                    html: "snafu"
                });
                $view.refresh("view3", {
                    html: "tarfu"
                });
                var pend = trx.pending();
                expect(pend.view1).toMatch({
                    action: "create",
                    exists: false
                });
                expect(pend.view2).toMatch({
                    action: "update",
                    exists: false
                });
                expect(pend.view3).toMatch({
                    action: "refresh",
                    exists: false
                });
                trx.cancel();
            });
        });
        it('update takes is prioritized over create in transactions.', function () {
            mock.inject(function ($view) {
                var trx = $view.beginUpdate();
                $view.update("view1", {
                    html: "fubar"
                });
                $view.create("view1", {
                    html: "fubar"
                });
                $view.create("view2", {
                    html: "snafu"
                });
                $view.update("view2", {
                    html: "snafu"
                });
                var pend = trx.pending();
                expect(pend.view1).toMatch({
                    action: "update",
                    exists: false
                });
                expect(pend.view2).toMatch({
                    action: "update",
                    exists: false
                });
                trx.cancel();
            });
        });
        it('pending returns changes about to happen.', function () {
            mock.inject(function ($view) {
                var trx = $view.beginUpdate();
                $view.create("view1", {
                    html: "fubar"
                });
                $view.create("view2", {
                    html: "snafu"
                });
                $view.create("view3", {
                    html: "tarfu"
                });
                trx.commit();
                trx = $view.beginUpdate();
                $view.create("view1", {
                    html: "fubar"
                });
                $view.update("view2", {
                    html: "snafu"
                });
                $view.refresh("view3", {
                    html: "tarfu"
                });
                trx.commit();
                var pend = trx.pending();
                expect(pend.view1).toMatch({
                    action: "create",
                    exists: true
                });
                expect(pend.view2).toMatch({
                    action: "update",
                    exists: true
                });
                expect(pend.view3).toMatch({
                    action: "refresh",
                    exists: true
                });
                trx.cancel();
            });
        });
    });
});
