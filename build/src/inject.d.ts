/// <reference path="refs.d.ts" />
interface IInjectFn {
    invoker(locals: any): any;
}
declare var $InjectProvider: any[];
declare class InjectFn implements IInjectFn {
    private fn;
    private $inject;
    private static FN_ARGS;
    private static FN_ARG_SPLIT;
    private static FN_ARG;
    private static STRIP_COMMENTS;
    private func;
    constructor(fn: any, $inject: ng.auto.IInjectorService);
    public invoker(locals: any): any;
}
