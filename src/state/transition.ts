/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../common.ts" />
/// <reference path="../interfaces.d.ts" />

/// <reference path="stateRules.ts" />
/// <reference path="stateFactory.ts" />

class Transition {
    public canceled = false;

    constructor(private gotofn) {
    }

    public cancel() {
        this.canceled = true;
    }

    public goto(state, params?) {
        this.cancel();
        this.gotofn({ state: state, params: { all: params }, updateroute: true })
    }

}