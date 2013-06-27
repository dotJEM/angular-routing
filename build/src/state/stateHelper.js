var ui;
(function (ui) {
    /// <reference path="stateWrapper.ts" />
    /// <reference path="stateFactory.ts" />
    (function (routing) {
        //TODO: Implement as Angular Provider.
        var StateRules = (function () {
            function StateRules() { }
            StateRules.nameValidation = /^\w+(\.\w+)*?$/;
            StateRules.validateName = function validateName(name) {
                if(StateRules.nameValidation.test(name)) {
                    return;
                }
                throw new Error("Invalid name: '" + name + "'.");
            };
            return StateRules;
        })();
        routing.StateRules = StateRules;        
        var StateBrowser = (function () {
            function StateBrowser(root) {
                this.root = root;
            }
            StateBrowser.prototype.lookup = function (fullname, stop) {
                var current = this.root, names = fullname.split('.'), i = names[0] === 'root' ? 1 : 0, stop = isDefined(stop) ? stop : 0;
                for(; i < names.length - stop; i++) {
                    if(!(names[i] in current.children)) {
                        throw new Error("Could not locate '" + names[i] + "' under '" + current.fullname + "'.");
                    }
                    current = current.children[names[i]];
                }
                return current;
            };
            StateBrowser.prototype.resolve = function (origin, path) {
                var _this = this;
                var match = path.match('^\\$node\\(([-+]?\\d+)\\)$'), selected = origin, sections;
                if(match) {
                    selected = this.selectSibling(Number(match[1]), selected);
                } else {
                    sections = path.split('/');
                    forEach(sections, function (sec) {
                        selected = _this.select(origin, sec, selected);
                    });
                }
                if(selected === this.root) {
                    throw new Error("Path expression out of bounds.");
                }
                return selected && extend({
                }, selected.self) || undefined;
            };
            StateBrowser.prototype.selectSibling = function (index, selected) {
                var children = [], currentIndex;
                forEach(selected.parent.children, function (child) {
                    children.push(child);
                    if(selected.fullname === child.fullname) {
                        currentIndex = children.length - 1;
                    }
                });
                while(index < 0) {
                    index += children.length;
                }
                index = (currentIndex + index) % children.length;
                return children[index];
            };
            StateBrowser.prototype.select = function (origin, exp, selected) {
                //TODO: Support full naming...
                if(exp === '.') {
                    if(origin !== selected) {
                        throw new Error("Invalid path expression. Can only define '.' i the beginning of an expression.");
                    }
                    return selected;
                }
                if(exp === '..') {
                    if(isUndefined(selected.parent)) {
                        throw new Error("Path expression out of bounds.");
                    }
                    return selected.parent;
                }
                if(exp === '') {
                    if(origin !== selected) {
                        throw new Error("Invalid path expression.");
                    }
                    return this.root;
                }
                var match = exp.match('^\\[(-?\\d+)\\]$');
                if(match) {
                    var index = Number(match[1]), children = [];
                    forEach(selected.children, function (child) {
                        children.push(child);
                    });
                    if(Math.abs(index) >= children.length) {
                        throw new Error("Index out of bounds, index selecter must not exeed child count or negative childcount");
                    }
                    return index < 0 ? children[children.length + index] : children[index];
                }
                if(exp in selected.children) {
                    return selected.children[exp];
                }
                throw new Error("Could find state for the lookup path.");
            };
            return StateBrowser;
        })();
        routing.StateBrowser = StateBrowser;        
        var StateComparer = (function () {
            function StateComparer() { }
            StateComparer.prototype.buildStateArray = function (state, params) {
                function extractParams() {
                    var paramsObj = {
                    };
                    if(current.route) {
                        forEach(current.route.params, function (param, name) {
                            paramsObj[name] = params[name];
                        });
                    }
                    return paramsObj;
                }
                var states = [], current = state;
                do {
                    states.push({
                        state: current,
                        params: extractParams()
                    });
                }while(current = current.parent);
                return states;
            };
            StateComparer.prototype.compare = function (from, to, fromParams, toParams, forceReload) {
                var fromArray = this.buildStateArray(from, fromParams || {
                }), toArray = this.buildStateArray(to, toParams), count = Math.max(fromArray.length, toArray.length), fromAtIndex, toAtIndex, c, stateChanges = false, paramChanges = !equals(fromParams, toParams);
                for(var i = 0; i < count; i++) {
                    fromAtIndex = fromArray[fromArray.length - i - 1];
                    toAtIndex = toArray[toArray.length - i - 1];
                    if(isUndefined(toAtIndex)) {
                        toArray[0].isChanged = stateChanges = true;
                    } else if(isUndefined(fromAtIndex) || (forceReload && forceReload == toAtIndex.state.fullname) || toAtIndex.state.fullname !== fromAtIndex.state.fullname || !equals(toAtIndex.params, fromAtIndex.params)) {
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
            };
            return StateComparer;
        })();
        routing.StateComparer = StateComparer;        
    })(ui.routing || (ui.routing = {}));
    var routing = ui.routing;
})(ui || (ui = {}));
