/// <reference path="../../refs.d.ts" />

interface IContext {
    begin(): ng.IPromise<any>;
}

interface ITransition {
    push(stage: IStage);
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

//var trx = {
//    locals: context.locals,
//    canceled: false,
//    cancel: function () {
//        trx.canceled = true;
//    },
//    goto: function (state, params?) {
//        trx.canceled = true;
//        gotofn({ state: state, params: { all: params }, updateroute: true });
//    }
//};

//TODO: stateTransition.create should be suffice for the factory.
class Factory implements IFactory {
    factories: IStageFactory[] = [];

    constructor(public inject: ng.auto.IInjectorService, private q: ng.IQService) { }

    public create(state: any, params: any, updateroute?: boolean) : ITransition {
        var trans = new Transition(state, params, updateroute);
        forEach(this.factories,  (fac: IStageFactory) => {
            //TODO: Use injection.
            //var stage = null;
            trans.push(fac());
        });
        return trans;
    }
}

class Transition implements ITransition {
    stages: IStage[] = [];
    constructor(private state: any, private params: any, private updateroute?: boolean) { }



    public push(stage: IStage) {
        this.stages.push(stage);
    }

    public execute(context: IContext): ITransition {
        var q: ng.IPromise<any> = context.begin();
        forEach(this.stages, function (stage: IStage) {
            q = q.then(function () {
                return stage.execute(context);
            });
        });

        return this;
    }
}