/// <reference path="../refs.d.ts" />

/// <reference path="state.ts" />
class StateComparer {
    public isSameState(from, to) {
        if (from === to) {
            return true;
        }

        //Note: If one of them is undefined, note that if both are undefined the above if would have returned.
        if (isUndefined(from) || isUndefined(to)) {
            return false;
        }

        return to.name === from.name;
    }

    public isEquals(from, to) {
        //TODO: we should check against all params 
        //return this.isSameState(from, to) && (!to.searchChanges || equals(to.params, from.params));
        return this.isSameState(from, to) && equals(to.params, from.params);
    }

    public path(from, to, fromParams, toParams, options?) {
        var fromArray = this.toArray(from, fromParams, false),
            toArray = this.toArray(to, toParams, true),
            count = Math.max(fromArray.length, toArray.length),
            searchChanges = !equals(fromParams.$search, toParams.$search),
            unchanged = [], deactivated = [], activated = [], change: any = {};

        options = options || {};

        for (var i = 0; i < count; i++) {
            var f = fromArray[i], t = toArray[i];

            if (!this.isEquals(f, t) || (t.reloadSearch && searchChanges) || options.force === (isDefined(t) && t.name)) {
                deactivated = deactivated.concat(fromArray.slice(i, fromArray.length));
                deactivated.reverse();
                activated = activated.concat(toArray.slice(i, toArray.length));
                break;
            } else {
                if (i === toArray.length - 1) {
                    t.isLeaf = true;
                    change.leaf = t;
                    if (toArray.length !== fromArray.length) {
                        //Note: In the case that we are stepping a step up, we provide this information to allow reload of that state.
                        //       - Technically we should be able to figure this out without this addition, but for now it's convinient.
                        change.reloadLeaf = true;
                    }
                }
                //t.active = false;
                t.changed = false;
                unchanged.push(t);
            }
        }

        change.from = from;
        change.to = to;
        change.activated = activated;
        change.deactivated = deactivated;
        change.unchanged = unchanged;
        change.changed = deactivated.concat(activated);
        change.paramChanges = !equals(fromParams, toParams);
        //change.searchChanges = searchChanges;

        return change;
    }

    public toArray(state, params, activate) {
        var states = [],
            current = state;
        do {
            states.push({
                state: current,
                name: current.fullname,
                params: this.extractParams(params, current),
                active: activate,
                changed: activate,
                reloadSearch: isUndefined(current.reloadOnOptional) || current.reloadOnOptional
            });
        } while (current = current.parent);
        return states.reverse();
    }

    public extractParams(params, current) {
        var paramsObj = {};
        if (current.route) {
            forEach(current.route.params, (param, name) => {
                paramsObj[name] = params[name];
            });
        }
        return paramsObj;
    }
}