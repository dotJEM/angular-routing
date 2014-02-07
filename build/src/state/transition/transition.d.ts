/// <reference path="../../refs.d.ts" />
interface IContext {
    begin(): ng.IPromise<any>;
}
interface ITransition {
    push(stage: IStage): any;
    execute(context: IContext): ITransition;
}
interface IStage {
    execute(context: IContext): ng.IPromise<any>;
}
interface IStageFactory {
    (): IStage;
}
interface IFactory {
    create(state: any, params: any, updateroute?: boolean): ITransition;
}
interface IStateTransition {
    locals: any;
    canceled: boolean;
    cancelReason: any;
    cancel: (reason?: any) => void;
    goto: (state: any, params?: any) => void;
}
declare class Factory implements IFactory {
    public inject: ng.auto.IInjectorService;
    private q;
    public factories: IStageFactory[];
    constructor(inject: ng.auto.IInjectorService, q: ng.IQService);
    public create(state: any, params: any, updateroute?: boolean): ITransition;
}
declare class Transition implements ITransition {
    private state;
    private params;
    private updateroute;
    public stages: IStage[];
    constructor(state: any, params: any, updateroute?: boolean);
    public push(stage: IStage): void;
    public execute(context: IContext): ITransition;
}
