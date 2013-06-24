var ui;
(function (ui) {
    (function (routing) {
        //TODO: Ones completely implementing to replace the object created by the state provider
        //      rename to "State". and "IState"...
        var StateClass = (function () {
            function StateClass(_name, _fullname, _self, _parent) {
                this._name = _name;
                this._fullname = _fullname;
                this._parent = _parent;
                this._children = {
                };
                //Note: we don't gard for names with no '.' (root) as the code below will actually give
                //      the correct result (the whole string) as lastIndexOf returns -1 resulting in starting
                //      at 0.
                //TODO: This should be performed by the factory instead.
                //this._name = _fullname.split('.').pop();
                this._self = _self;
                //TODO: This should be performed by the factory instead.
                //if (isDefined(_parent))
                //    this._self.$fullname = _parent.fullname + "." + this.name;
                //else
                this._self.$fullname = _fullname;
                this._reloadOnOptional = !isDefined(_self.reloadOnSearch) || _self.reloadOnSearch;
            }
            Object.defineProperty(StateClass.prototype, "children", {
                get: function () {
                    return this._children;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(StateClass.prototype, "fullname", {
                get: function () {
                    return this._fullname;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(StateClass.prototype, "name", {
                get: function () {
                    return this._name;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(StateClass.prototype, "reloadOnOptional", {
                get: function () {
                    return this._reloadOnOptional;
                },
                set: function (value) {
                    this._reloadOnOptional = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(StateClass.prototype, "self", {
                get: function () {
                    return copy(this._self);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(StateClass.prototype, "parent", {
                get: function () {
                    return this._parent;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(StateClass.prototype, "route", {
                get: function () {
                    return this._route;
                },
                set: function (value) {
                    if(isUndefined(value)) {
                        throw 'Please supply time interval';
                    }
                    this._route = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(StateClass.prototype, "root", {
                get: function () {
                    if(this.parent === null) {
                        return this;
                    }
                    return this._parent.root;
                },
                enumerable: true,
                configurable: true
            });
            StateClass.prototype.add = function (child) {
                this._children[child.name] = child;
                return this;
            };
            StateClass.prototype.resolveRoute = function () {
                return isDefined(this.route) ? this.route.route : isDefined(this.parent) ? this.parent.resolveRoute() : '';
            };
            StateClass.prototype.internalLookup = function (names, stop) {
                var next, state, stop = isDefined(stop) ? stop : 0;
                if(names.length == stop) {
                    return this;
                }
                next = names.shift();
                state = this._children[next];
                if(isUndefined(state)) {
                    throw "Could not locate '" + next + "' under '" + this.fullname + "'.";
                }
                return state.internalLookup(names, stop);
            };
            StateClass.prototype.lookup = function (fullname, stop) {
                var names = fullname.split('.');
                if(names[0] === 'root') {
                    names.shift();
                }
                return this.internalLookup(names, stop);
            };
            return StateClass;
        })();
        routing.StateClass = StateClass;        
        //function lookup(names: string[]) {
        //    var current = root,
        //        //If name contains root explicitly, skip that one
        //        i = names[0] === 'root' ? 1 : 0;
        //    for (; i < names.length; i++) {
        //        if (!(names[i] in current.children))
        //            throw new Error("Could not locate '" + names[i] + "' under '" + current.fullname + "'.");
        //        current = current.children[names[i]];
        //    }
        //    return current;
        //}
            })(ui.routing || (ui.routing = {}));
    var routing = ui.routing;
})(ui || (ui = {}));
