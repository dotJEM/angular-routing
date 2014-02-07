/// <reference path="../../refs.d.ts" />

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
//TODO: stateTransition.create should be surfice for the factory.
var Factory = (function () {
    function Factory(inject, q) {
        this.inject = inject;
        this.q = q;
        this.factories = [];
    }
    Factory.prototype.create = function (state, params, updateroute) {
        var trans = new Transition(state, params, updateroute);
        forEach(this.factories, function (fac) {
            //TODO: Use injection.
            //var stage = null;
            trans.push(fac());
        });
        return trans;
    };
    return Factory;
})();

var Transition = (function () {
    function Transition(state, params, updateroute) {
        this.state = state;
        this.params = params;
        this.updateroute = updateroute;
        this.stages = [];
    }
    Transition.prototype.push = function (stage) {
        this.stages.push(stage);
    };

    Transition.prototype.execute = function (context) {
        var q = context.begin();
        forEach(this.stages, function (stage) {
            q = q.then(function () {
                return stage.execute(context);
            });
        });

        return this;
    };
    return Transition;
})();
