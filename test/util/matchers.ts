/// <reference path="../testcommon.ts" />
declare module jasmine {
    interface Matchers {
        toHaveProperties(expected): boolean;
    }
}

beforeEach(function () {
    var jasm: any = jasmine;
    this.addMatchers({

        toHaveProperties: function (expectedProperties) {
            var act = this.actual,
                fails = [];

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