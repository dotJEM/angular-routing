var ui;
(function (ui) {
    /// <reference path="../../lib/angular/angular-1.0.d.ts" />
    /// <reference path="../common.ts" />
    /// <reference path="../interfaces.d.ts" />
    /// <reference path="stateRules.ts" />
    /// <reference path="stateFactory.ts" />
    (function (routing) {
        //TODO: Ones completely implementing to replace the object created by the state provider
        //      rename to "State". and "IState"...
        var State = (function () {
            function State(_name, _fullname, _self, _parent) {
                this._name = _name;
                this._fullname = _fullname;
                this._parent = _parent;
                this._children = {
                };
                this._self = _self;
                this._self.$fullname = _fullname;
                this._reloadOnOptional = !isDefined(_self.reloadOnSearch) || _self.reloadOnSearch;
            }
            Object.defineProperty(State.prototype, "children", {
                get: function () {
                    return this._children;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(State.prototype, "fullname", {
                get: function () {
                    return this._fullname;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(State.prototype, "name", {
                get: function () {
                    return this._name;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(State.prototype, "reloadOnOptional", {
                get: function () {
                    return this._reloadOnOptional;
                },
                set: function (value) {
                    this._reloadOnOptional = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(State.prototype, "self", {
                get: function () {
                    return copy(this._self);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(State.prototype, "parent", {
                get: function () {
                    return this._parent;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(State.prototype, "route", {
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
            Object.defineProperty(State.prototype, "root", {
                get: function () {
                    if(this.parent === null) {
                        return this;
                    }
                    return this._parent.root;
                },
                enumerable: true,
                configurable: true
            });
            State.prototype.add = function (child) {
                this._children[child.name] = child;
                return this;
            };
            State.prototype.resolveRoute = function () {
                return isDefined(this.route) ? this.route.route : isDefined(this.parent) ? this.parent.resolveRoute() : '';
            };
            return State;
        })();
        routing.State = State;        
    })(ui.routing || (ui.routing = {}));
    var routing = ui.routing;
})(ui || (ui = {}));
