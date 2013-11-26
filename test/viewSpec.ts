/// <reference path="testcommon.ts" />

describe('$view', function () {
    'use strict';
    var mock = angular.mock;
    var template,
        scope;

    beforeEach(mock.module('dotjem.routing', function () {
        return function ($template, $rootScope, $view) {
            template = $template;
            scope = $rootScope;

            spyOn(template, 'get').andCallFake(value => value.html);
        };
    }));

    describe("update", () => {
        it('saves initial view state', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                $view.update("name", { template: { html: "template" } });

                var view = $view.get('name');

                expect(view.template).toBe("template");
                expect(view.version).toBe(0);
            });
        });

        it('updates view state and increments version', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                $view.update("name", { template: { html: "fubar" } });
                $view.update("name", { template: { html: "template" } });

                var view = $view.get('name');

                expect(view.template).toBe("template");
                expect(view.version).toBe(1);
            });
        });

        it('cleared view gets reinitialized', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                $view.update("name", { template: { html: "fubar" } });
                $view.clear("name");
                $view.update("name", { template: { html: "template" } });

                var view = $view.get('name');

                expect(view.template).toBe("template");
                expect(view.version).toBe(0);
            });
        });

        it('raises $viewUpdate with viewName', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                var spy = spyOn(scope, '$broadcast');

                $view.update("name", { template: { html: "fubar" } });
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args).toEqual(['$viewUpdate', "name"]);

                $view.update("name", { template: { html: "template" } });
                expect(spy.callCount).toBe(2);
                expect(spy.mostRecentCall.args).toEqual(['$viewUpdate', "name"]);
            });
        });

        it('raises $viewUpdate with viewName for each view', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                var spy = spyOn(scope, '$broadcast');

                $view.update("root", { template: { html: "fubar" } });
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args).toEqual(['$viewUpdate', "root"]);

                $view.update("sub", { template: { html: "template" } });
                expect(spy.callCount).toBe(2);
                expect(spy.mostRecentCall.args).toEqual(['$viewUpdate', "sub"]);
            });
        });

        it('raises $viewRefresh when sticky tag matches', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                var spy = spyOn(scope, '$broadcast');

                $view.update("root", { template: { html: "fubar" }, sticky: "sticky" });
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args).toEqual(['$viewUpdate', "root"]);

                $view.update("root", { template: { html: "template" }, sticky: "sticky" });
                expect(spy.callCount).toBe(2);
                expect(spy.mostRecentCall.args).toEqual([<any>'$viewRefresh', "root", { sticky: "sticky" }]);
            });
        });

        it('raises $viewUpdate when sticky tag differs', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                var spy = spyOn(scope, '$broadcast');

                $view.update("root", { template: { html: "fubar" }, sticky: "sticky" });
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args).toEqual(['$viewUpdate', "root"]);

                $view.update("root", { template: { html: "template" }, sticky: "sticky2" });
                expect(spy.callCount).toBe(2);
                expect(spy.mostRecentCall.args).toEqual(['$viewUpdate', "root"]);
            });
        });

        it('raises $viewUpdate when sticky tag is undefined', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                var spy = spyOn(scope, '$broadcast');

                $view.update("root", { template: { html: "fubar" } });
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args).toEqual(['$viewUpdate', "root"]);

                $view.update("root", { template: { html: "template" } });
                expect(spy.callCount).toBe(2);
                expect(spy.mostRecentCall.args).toEqual(['$viewUpdate', "root"]);
            });
        });
    });

    describe("refresh", () => {


        it('raises $viewRefresh with provided data', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                $view.update('root', { template: { html: "fubar" } });

                var spy = spyOn(scope, '$broadcast');

                $view.refresh("root", { stuff: "fubar" });
                expect(spy.mostRecentCall.args).toEqual([<any>'$viewRefresh', "root", { $locals: undefined, stuff: "fubar" }]);
            });
        });

        it('raises $viewRefresh and preserves locals', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                $view.update('root', { template: { html: "fubar" }, controller: '', locals: { local: "hello" } });

                var spy = spyOn(scope, '$broadcast');

                $view.refresh("root", { stuff: "fubar" });
                expect(spy.mostRecentCall.args).toEqual([<any>'$viewRefresh', "root", { $locals: { local: "hello" }, stuff: "fubar" }]);
            });
        });
    });

    describe("setIfAbsent", () => {
        it('saves initial view state', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                $view.create("name", { template: { html: "template" } });

                var view = $view.get('name');

                expect(view.template).toBe("template");
                expect(view.version).toBe(0);
            });
        });

        it('does not update view state if it already exists', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                $view.create("name", { template: { html: "template" } });
                $view.create("name", { template: { html: "fubar" } });

                var view = $view.get('name');

                expect(view.template).toBe("template");
                expect(view.version).toBe(0);
            });
        });

        it('updates view state if it was cleared', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                $view.create("name", { template: { html: "fubar" } });
                $view.clear("name");
                $view.create("name", { template: { html: "template" } });

                var view = $view.get('name');

                expect(view.template).toBe("template");
                expect(view.version).toBe(0);
            });
        });

        it('raises $viewUpdated with viewName only for first call', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                var spy = spyOn(scope, '$broadcast');

                $view.create("name", { template: { html: "fubar" } });
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args[1]).toBe("name");

                $view.create("name", { template: { html: "template" } });
                expect(spy.callCount).toBe(1);
            });
        });

        it('raises $viewUpdated with viewName for each view', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                var spy = spyOn(scope, '$broadcast');

                $view.create("root", { template: { html: "fubar" } });
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args[1]).toBe("root");

                $view.create("sub", { template: { html: "template" } });
                expect(spy.callCount).toBe(2);
                expect(spy.mostRecentCall.args[1]).toBe("sub");
            });
        });
    });

    describe("clear", () => {
        it('no parameters clears state', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                $view.create("root", { template: { html: "root template" } });
                $view.create("sub1", { template: { html: "sub1 template" } });
                $view.create("sub2", { template: { html: "sub2 template" } });
                $view.clear();

                expect($view.get("root")).toBeUndefined();
                expect($view.get("sub1")).toBeUndefined();
                expect($view.get("sub2")).toBeUndefined();
            });
        });

        it('with parameters will set view to undefined (delete it)', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                $view.create("root", { template: { html: "root template" } });
                $view.create("sub1", { template: { html: "sub1 template" } });
                $view.create("sub2", { template: { html: "sub2 template" } });
                $view.clear("sub2");

                expect($view.get("root")).toBeDefined();
                expect($view.get("sub1")).toBeDefined();
                expect($view.get("sub2")).toBeUndefined();
            });
        });

        it('clear raises $viewUpdated with viewName for cleared view', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                $view.create("root", { template: { html: "root template" } });
                $view.create("sub1", { template: { html: "sub1 template" } });
                $view.create("sub2", { template: { html: "sub2 template" } });

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

    describe("$viewUpdate", () => {
        it('raised when setOrUpdate is called', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                var spy = spyOn(scope, '$broadcast');

                $view.update("root", { template: { html: "root template" } });
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args[1]).toBe("root");
                expect(spy.mostRecentCall.args[0]).toBe("$viewUpdate");

                $view.update("root", { template: { html: "sub1 template" } });
                expect(spy.callCount).toBe(2);
                expect(spy.mostRecentCall.args[1]).toBe("root");
                expect(spy.mostRecentCall.args[0]).toBe("$viewUpdate");

                $view.update("root", { template: { html: "sub2 template" } });
                expect(spy.callCount).toBe(3);
                expect(spy.mostRecentCall.args[1]).toBe("root");
                expect(spy.mostRecentCall.args[0]).toBe("$viewUpdate");
            });
        });

        it('raised only first time when setIfAbsent is called with same name', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                var spy = spyOn(scope, '$broadcast');

                $view.create("root", { template: { html: "root template" } });
                expect(spy.callCount).toBe(1);
                expect(spy.mostRecentCall.args[1]).toBe("root");
                expect(spy.mostRecentCall.args[0]).toBe("$viewUpdate");

                $view.create("root", { template: { html: "root template" } });
                expect(spy.callCount).toBe(1);

                $view.create("root", { template: { html: "root template" } });
                expect(spy.callCount).toBe(1);
            });
        });

        it('raised on clear with name', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                $view.update("view1", { template: { html: "view1 template" } });
                $view.update("view2", { template: { html: "view2 template" } });
                $view.update("view3", { template: { html: "view3 template" } });

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

    describe("beginUpdate", () => {
        it('setIfAbsent does not overwrite even during transactional update', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                var trx = $view.beginUpdate();

                $view.create("root", { template: { html: "root" } });
                $view.create("root", { template: { html: "fubar" } });

                trx.commit();

                expect($view.get("root").template).toBe("root");
            });
        });

        it('get returns old state untill commit is called', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                var trx = $view.beginUpdate();

                $view.create("root", { template: { html: "root" } });
                $view.create("root", { template: { html: "fubar" } });

                expect($view.get("root")).toBeUndefined();

                trx.commit();

                expect($view.get("root").template).toBe("root");
            });
        });

        it('is not raised until after commit during transactional updates', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                var spy = spyOn(scope, '$broadcast');

                var trx = $view.beginUpdate();
                $view.update("view1", { template: { html: "view1 template" } });
                $view.update("view2", { template: { html: "view2 template" } });
                $view.update("view3", { template: { html: "view3 template" } });

                expect(spy.callCount).toBe(0);

                trx.commit();

                expect(spy.callCount).toBe(3);
                expect(spy.calls[0].args[1]).toBe('view1');
                expect(spy.calls[1].args[1]).toBe('view2');
                expect(spy.calls[2].args[1]).toBe('view3');
            });
        });

        it('is only raised ones pr name after commit during transactional updates', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                var spy = spyOn(scope, '$broadcast');

                var trx = $view.beginUpdate();
                $view.update("view1", { template: { html: "view1 template" } });
                $view.update("view2", { template: { html: "view2 template" } });
                $view.update("view3", { template: { html: "view3 template" } });
                $view.update("view1", { template: { html: "view1 template" } });
                $view.update("view2", { template: { html: "view2 template" } });
                $view.update("view3", { template: { html: "view3 template" } });

                expect(spy.callCount).toBe(0);

                trx.commit();

                expect(spy.callCount).toBe(3);
                expect(spy.calls[0].args[1]).toBe('view1');
                expect(spy.calls[1].args[1]).toBe('view2');
                expect(spy.calls[2].args[1]).toBe('view3');
            });
        });

        it('is not raised after cancel during transactional updates', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                var spy = spyOn(scope, '$broadcast');

                var trx = $view.beginUpdate();
                $view.update("view1", { template: { html: "view1 template" } });
                $view.update("view2", { template: { html: "view2 template" } });
                $view.update("view3", { template: { html: "view3 template" } });

                expect(spy.callCount).toBe(0);

                trx.cancel();

                expect(spy.callCount).toBe(1);
                expect(spy.calls[0].args[0]).toBe('$viewPrep');
            });
        });

        it('clear causes viet to be cleared after commit', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                $view.update("root", { template: { html: "root" } });
                
                var trx = $view.beginUpdate();

                $view.clear("root");

                expect($view.get("root")).toBeDefined();

                trx.commit();

                expect($view.get("root")).toBeUndefined();
            });
        });

        it('clear causes viet to be cleared after commit', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                $view.update("root", { template: { html: "root" } });

                var spy = spyOn(scope, '$broadcast');

                var trx = $view.beginUpdate();
                $view.refresh("root", { template: { html: "custom data" } });

                expect(spy.callCount).toBe(0);

                trx.commit();

                expect(spy.callCount).toBe(1);
                expect(spy.calls[0].args[0]).toBe('$viewRefresh');
                expect(spy.calls[0].args[1]).toBe('root');
            });
        });

        it('pending returns changes about to happen.', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                var trx = $view.beginUpdate();
                $view.create("view1", { template: { html: "fubar" } });
                $view.update("view2", { template: { html: "snafu" } });
                $view.refresh("view3", { template: { html: "tarfu" } });

                var pend = trx.pending();

                expect(pend.view1).toEqual({ action: "load" });
                expect(pend.view2).toEqual({ action: "update" });
                expect(pend.view3).toEqual({ action: "refresh" });

                trx.cancel();
            });
        });

        it('update takes is prioritized over create in transactions.', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                var trx = $view.beginUpdate();
                $view.update("view1", { template: { html: "fubar" } });
                $view.create("view1", { template: { html: "fubar" } });

                $view.create("view2", { template: { html: "snafu" } });
                $view.update("view2", { template: { html: "snafu" } });
                var pend = trx.pending();
                trx.cancel();

                expect(pend.view1).toEqual({ action: "update" });
                expect(pend.view2).toEqual({ action: "update" });

            });
        });

        it('pending returns changes about to happen.', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                var trx = $view.beginUpdate();
                $view.create("view1", { template: { html: "fubar" } });
                $view.create("view2", { template: { html: "snafu" } });
                $view.create("view3", { template: { html: "tarfu" } });
                trx.commit();

                trx = $view.beginUpdate();
                $view.create("view1", { html: "fubar" });
                $view.update("view2", { html: "snafu" });
                $view.refresh("view3", { html: "tarfu" });
                var pend = trx.pending();
                trx.cancel();

                expect(pend.view1).toEqual({ action: "keep" });
                expect(pend.view2).toEqual({ action: "update" });
                expect(pend.view3).toEqual({ action: "refresh" });
            });
        });

        it('pending returns changes about to happen 2.', function () {
            mock.inject(function ($view: dotjem.routing.IViewService) {
                var trx = $view.beginUpdate();
                $view.update("view1", { template: { html: "fubar" }, sticky: "sticky" });
                $view.update("view2", { template: { html: "snafu" }, sticky: "sticky" });
                trx.commit();

                trx = $view.beginUpdate();
                $view.update("view1", { template: { html: "fubar" }, sticky: "sticky" });
                $view.update("view2", { template: { html: "snafu" }, sticky: "stack" });
                var pend = trx.pending();
                trx.cancel();

                expect(pend.view1).toEqual({ action: "refresh" });
                expect(pend.view2).toEqual({ action: "update" });
            });
        });
    });
});