/// <reference path="../../refs.d.ts" />
var Context = (function () {
    function Context(_$state, onComplete, current) {
        this.aborted = false;
        this.completed = false;
        this._prep = {};
        this._$state = _$state;
        this.to = current;
        this.onComplete = onComplete;
    }
    Object.defineProperty(Context.prototype, "$state", {
        get: function () {
            return this._$state;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Context.prototype, "ended", {
        get: function () {
            return this.aborted || this.completed;
        },
        enumerable: true,
        configurable: true
    });

    Context.prototype.next = function (onComplete) {
        if (!this.ended) {
            this.abort();
        }

        var next = new Context(this.$state, onComplete);
        next.previous = this;
        next.from = this.to;

        //Note: to allow garbage collection.
        this.previous = null;

        return next;
    };

    Context.prototype.execute = function (visitor) {
        if (!this.ended) {
            visitor(this);
            if (this.aborted) {
                return this.previous;
            }
        }
        return this;
    };

    Context.prototype.complete = function () {
        if (!this.ended) {
            this.onComplete(this);
            this.completed = true;
        }
        return this;
    };

    Context.prototype.abort = function () {
        if (!this.ended) {
            this.aborted = true;
            if (this.transaction && !this.transaction.completed) {
                this.transaction.cancel();
            }
        }
        return this;
    };

    // change.state.fullname, name, view.template, view.controller, sticky, 'setOrUpdate'
    Context.prototype.prepUpdate = function (state, name, args) {
        var prep = (this._prep[state] = this._prep[state] || {});
        prep[name] = this.transaction.prepUpdate(name, args);
    };

    Context.prototype.prepCreate = function (state, name, args) {
        var prep = (this._prep[state] = this._prep[state] || {});
        prep[name] = this.transaction.prepCreate(name, args);
    };

    Context.prototype.completePrep = function (state, locals) {
        forEach(this._prep[state], function (value, key) {
            value(locals);
        });
    };
    return Context;
})();
