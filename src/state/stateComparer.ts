/// <reference path="../../lib/angular/angular-1.0.d.ts" />
/// <reference path="../common.ts" />
/// <reference path="../interfaces.d.ts" />

/// <reference path="state.ts" />
class StateComparer {
    public buildStateArray(state, params) {
        function extractParams() {
            var paramsObj = {};
            if (current.route) {
                forEach(current.route.params, (param, name) => {
                    paramsObj[name] = params[name];
                });
            }
            return paramsObj;
        }

        var states = [],
            current = state;
        do {
            states.push({ state: current, params: extractParams() });
        } while (current = current.parent)
        return states;
    }

    public compare(from, to, fromParams, toParams, forceReload) {
        var fromArray = this.buildStateArray(from, fromParams || {}),
            toArray = this.buildStateArray(to, toParams),
            count = Math.max(fromArray.length, toArray.length),
            fromAtIndex,
            toAtIndex,
            stateChanges = false,
            paramChanges = !equals(fromParams, toParams);

        for (var i = 0; i < count; i++) {
            fromAtIndex = fromArray[fromArray.length - i - 1];
            toAtIndex = toArray[toArray.length - i - 1];

            if (isUndefined(toAtIndex)) {
                toArray[0].isChanged = stateChanges = true;
            } else if (isUndefined(fromAtIndex)
                    || forceReload === toAtIndex.state.fullname
                    || toAtIndex.state.fullname !== fromAtIndex.state.fullname
                    || !equals(toAtIndex.params, fromAtIndex.params)) {
                toAtIndex.isChanged = stateChanges = true;
            } else {
                toAtIndex.isChanged = false;
            }
        }
        //TODO: if ReloadOnOptional is false, but parameters are changed.
        //      we should raise the update event instead.
        stateChanges = stateChanges || (toArray[0].state.reloadOnOptional && paramChanges);
        return {
            array: toArray.reverse(),
            stateChanges: stateChanges,
            paramChanges: paramChanges
        };
    }
}