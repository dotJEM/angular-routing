/// <reference path="../../refs.d.ts" />
var Context = (function () {
    function Context(_$state, current) {
        this.previous = {
        };
        this.properties = {
        };
        this.aborted = false;
        this.completed = false;
        this._prep = {
        };
        this.properties = {
        };
        this._$state = _$state;
        this.to = current;
    }
    Object.defineProperty(Context.prototype, "$state", {
        get: function () {
            return this._$state;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "to", {
        get: function () {
            return this.properties.to;
        },
        set: function (value) {
            this.properties.to = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "from", {
        get: function () {
            return this.properties.from;
        },
        set: function (value) {
            this.properties.from = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "params", {
        get: function () {
            return this.properties.params;
        },
        set: function (value) {
            this.properties.params = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "emit", {
        get: function () {
            return this.properties.emit;
        },
        set: function (value) {
            this.properties.emit = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "changed", {
        get: function () {
            return this.properties.changed;
        },
        set: function (value) {
            this.properties.changed = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "toState", {
        get: function () {
            return this.properties.toState;
        },
        set: function (value) {
            this.properties.toState = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "transition", {
        get: function () {
            return this.properties.transition;
        },
        set: function (value) {
            this.properties.transition = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "transaction", {
        get: function () {
            return this.properties.transaction;
        },
        set: function (value) {
            this.properties.transaction = value;
        },
        enumerable: true,
        configurable: true
    });
    Context.prototype.next = function () {
        if(!this.ended) {
            this.abort();
        }
        var next = new Context(this.$state);
        next.previous = this;
        next.from = this.to;
        //Note: to allow garbage collection.
        this.previous = null;
        return next;
    };
    Context.prototype.execute = function (visitor) {
        if(this.ended) {
            return this;
        }
        visitor(this);
        if(this.aborted) {
            return this.previous;
        }
        return this;
    };
    Object.defineProperty(Context.prototype, "ended", {
        get: function () {
            return this.aborted || this.completed;
        },
        enumerable: true,
        configurable: true
    });
    Context.prototype.complete = function () {
        this.completed = true;
        return this;
    };
    Context.prototype.abort = function () {
        this.aborted = true;
        if(this.transaction && !this.transaction.completed) {
            this.transaction.cancel();
        }
        return this;
    };
    Context.prototype.prepUpdate = // change.state.fullname, name, view.template, view.controller, sticky, 'setOrUpdate'
    function (state, name, template, controller, sticky) {
        var prep = (this._prep[state] = this._prep[state] || {
        });
        prep[name] = this.transaction.prepUpdate(name, template, controller, sticky);
    };
    Context.prototype.prepCreate = function (state, name, template, controller) {
        var prep = (this._prep[state] = this._prep[state] || {
        });
        prep[name] = this.transaction.prepCreate(name, template, controller);
    };
    Context.prototype.completePrep = function (state, locals) {
        forEach(this._prep[state], function (value, key) {
            value(locals);
        });
    };
    return Context;
})();
