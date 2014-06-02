/// <reference path="../testcommon.ts" />

beforeEach(function () {
    var jasm = jasmine;
    this.addMatchers({
        toHaveProperties: function (expectedProperties) {
            var act = this.actual, fails = [];

            angular.forEach(expectedProperties, function (value, key) {
                if (angular.isUndefined(act[key])) {
                    fails.push("Expected property '" + key + "' could not be found.");
                } else if (!angular.equals(act[key], value)) {
                    fails.push("Expected property '" + key + "' to be '" + jasm.pp(value) + "' but was '" + jasm.pp(act[key]) + "'.");
                }
            });

            this.message = function () {
                return fails.join("\n\r");
            };

            return fails.length === 0;
        }
    });
});
//getJasmineRequireObj().toBe = function () {
//    function toBe() {
//        return {
//            compare: function (actual, expected) {
//                return {
//                    pass: actual === expected
//                };
//            }
//        };
//    }
//    return toBe;
//};
