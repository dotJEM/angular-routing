var ui;
(function (ui) {
    (function (routing) {
        var StateFactory = (function () {
            function StateFactory() { }
            return StateFactory;
        })();
        routing.StateFactory = StateFactory;        
        var StateWrapper = (function () {
            //set timeInterval(value: number) {
            //    if (value === undefined) throw 'Please supply time interval';
            //    this._timeInterval = value;
            //}
            function StateWrapper(_self) {
                this._self = _self;
                this.children = {
                };
            }
            Object.defineProperty(StateWrapper.prototype, "fullname", {
                get: function () {
                    return this._fullname;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(StateWrapper.prototype, "self", {
                get: function () {
                    return this._self;
                },
                enumerable: true,
                configurable: true
            });
            StateWrapper.prototype.lookup = function (names) {
                var next = names.shift();
                if(!(next in this.children)) {
                    throw new Error("Could not locate '" + next + "' under '" + this.fullname + "'.");
                }
                return this.children[next].lookup(names);
            };
            return StateWrapper;
        })();
        routing.StateWrapper = StateWrapper;        
    })(ui.routing || (ui.routing = {}));
    var routing = ui.routing;
})(ui || (ui = {}));
