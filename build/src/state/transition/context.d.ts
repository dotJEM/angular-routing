/// <reference path="../../refs.d.ts" />
declare class Context {
    private previous;
    private _$state;
    public $state : dotjem.routing.IStateService;
    public ended : boolean;
    public to: any;
    public from: any;
    public params: any;
    public emit: any;
    public changed: any;
    public locals: any;
    public toState: any;
    public transition: any;
    public transaction: dotjem.routing.IViewTransaction;
    public aborted: boolean;
    public completed: boolean;
    public onComplete: ICommand;
    constructor(_$state: any, onComplete: ICommand, current?: any);
    public next(onComplete: ICommand): Context;
    public execute(visitor: ICommand): any;
    public complete(): Context;
    public abort(): Context;
    private _prep;
    public prepUpdate(state: string, name: any, args: dotjem.routing.IView): void;
    public prepCreate(state: string, name: any, args: dotjem.routing.IView): void;
    public completePrep(state: string, locals?: any): void;
}
