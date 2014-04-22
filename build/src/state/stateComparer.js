/// <reference path="../refs.d.ts" />
/// <reference path="state.ts" />
var StateComparer = (function () {
    function StateComparer() {
    }
    StateComparer.prototype.buildStateArray = function (state, params) {
        function extractParams() {
            var paramsObj = {};
            if (current.route) {
                forEach(current.route.params, function (param, name) {
                    paramsObj[name] = params[name];
                });
            }
            return paramsObj;
        }

        var states = [], current = state;
        do {
            states.push({ state: current, params: extractParams() });
        } while(current = current.parent);
        return states;
    };

    StateComparer.prototype.compare = function (from, to, fromParams, toParams, forceReload) {
        var fromArray = this.buildStateArray(from, fromParams || {}), toArray = this.buildStateArray(to, toParams), count = Math.max(fromArray.length, toArray.length), fromAtIndex, toAtIndex, stateChanges = false, paramChanges = !equals(fromParams, toParams);

        for (var i = 0; i < count; i++) {
            fromAtIndex = fromArray[fromArray.length - i - 1];
            toAtIndex = toArray[toArray.length - i - 1];

            if (isUndefined(toAtIndex)) {
                toArray[0].isChanged = stateChanges = true;
            } else if (isUndefined(fromAtIndex) || forceReload === toAtIndex.state.fullname || toAtIndex.state.fullname !== fromAtIndex.state.fullname || !equals(toAtIndex.params, fromAtIndex.params)) {
                toAtIndex.isChanged = stateChanges = true;
            } else {
                toAtIndex.isChanged = false;
            }
        }

        //TODO: if ReloadOnOptional is false, but parameters are changed.
        //      we should raise the update event instead.
        toArray[0].isChanged = stateChanges = stateChanges || (toArray[0].state.reloadOnOptional && paramChanges);
        return {
            array: toArray.reverse(),
            stateChanges: stateChanges,
            paramChanges: paramChanges
        };
    };

    StateComparer.prototype.isSameState = function (from, to) {
        if (from === to) {
            return true;
        }

        //Note: If one of them is undefined, note that if both are undefined the above if would have returned.
        if (isUndefined(from) || isUndefined(to)) {
            return false;
        }

        return to.name === from.name;
    };

    StateComparer.prototype.isEquals = function (from, to) {
        return this.isSameState(from, to) && equals(to.params, from.params);
    };

    StateComparer.prototype.path = function (from, to, fromParams, toParams) {
        var fromArray = this.toArray(from, fromParams, false), toArray = this.toArray(to, toParams, true), count = Math.max(fromArray.length, toArray.length);

        var unchanged = [];
        var deactivate = [];
        var activate = [];
        var change = {};

        for (var i = 0; i < count; i++) {
            var f = fromArray[i], t = toArray[i];
            if (this.isEquals(f, t)) {
                unchanged.push(f);
            } else if (this.isSameState(f, t)) {
                deactivate.push(f);
                activate.push(t);
            } else {
                deactivate = deactivate.concat(fromArray.slice(i, fromArray.length));
                deactivate.reverse();

                activate = activate.concat(toArray.slice(i, toArray.length));
                break;
            }
        }

        change.changed = deactivate.concat(activate);
        change.unchanged = unchanged;

        return change;
    };

    StateComparer.prototype.toArray = function (state, params, activate) {
        var states = [], current = state;
        do {
            states.push({ state: current, name: current.fullname, params: this.extractParams(params, current), activate: activate });
        } while(current = current.parent);
        states.reverse();
        return states;
    };

    StateComparer.prototype.extractParams = function (params, current) {
        var paramsObj = {};
        if (current.route) {
            forEach(current.route.params, function (param, name) {
                paramsObj[name] = params[name];
            });
        }
        return paramsObj;
    };
    return StateComparer;
})();
