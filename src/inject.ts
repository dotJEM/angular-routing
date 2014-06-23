/// <reference path="refs.d.ts" />

interface IInjectFn {
    invoker(locals: any);
}

var $InjectProvider = [<any>
    function () {
        'use strict';

        this.$get = [<any> '$injector',
            function ($injector: ng.auto.IInjectorService): dotjem.routing.IInjectService {
                function createInvoker(fn): dotjem.routing.IInvoker {
                    if (isInjectable(fn)) {
                        var injector = new InjectFn(fn, $injector);
                        return function (locals?: any) {
                            return injector.invoker(locals);
                        };
                    }
                    return null;
                }

                return {
                    //Note: Rerouting of injector functions in cases where those are move convinient.
                    get: $injector.get,
                    annotate: $injector.annotate,
                    instantiate: $injector.instantiate,
                    invoke: $injector.invoke,

                    accepts: isInjectable,
                    create: createInvoker
                };
            }];
    }];
angular.module('dotjem.routing').provider('$inject', $InjectProvider);

//Note: All parts that has been commented out here is purpously left there as they are for a later optimization.
//      of all internal inject handlers.
class InjectFn implements IInjectFn {
    private static FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    private static FN_ARG_SPLIT = /,/;
    private static FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    private static STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    private dependencies: string[];
    private func: any;

    //private invokerFn: dotjem.routing.IInvoker;

    constructor(private fn: any, private $inject: ng.auto.IInjectorService) {
        //var last;
        this.dependencies = $inject.annotate(fn);
        if (isArray(fn)) {
            this.func = fn[fn.length - 1];
        } else if (isFunction(fn)) {
            this.func = fn;
        }
    }

    public invoker(locals: any): any {
        return this.$inject.invoke(this.fn, this.func, locals);
        //Note: This part does not work, nor is it optimized as it should.
        //      generally when creating a handler through here locals are static meaning we can predict how the arg
        //      array should be resolved, therefore we can cache all services we require from the injector and just
        //      patch in locals on calls.
        //
        //if (this.invokerFn == null) {
        //    this.invokerFn = (locals?: any) => {
        //        var args = [];
        //        var l = this.dependencies.length;
        //        var i = 0, key;

        //        for (; i < length; i++) {
        //            key = this.dependencies[i];
        //            args.push(
        //              locals && locals.hasOwnProperty(key)
        //              ? locals[key]
        //              : this.$inject.get(key)
        //            );
        //        }
        //        return this.func.apply(self, args);
        //    };
        //}
        //return this.invokerFn(locals);
    }
}