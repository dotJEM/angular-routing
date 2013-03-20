'use strict';
var isDefined = angular.isDefined, isFunction = angular.isFunction, isString = angular.isString, isObject = angular.isObject, forEach = angular.forEach, extend = angular.extend, copy = angular.copy;
function inherit(parent, extra) {
    return extend(new (extend(function () {
    }, {
        prototype: parent
    }))(), extra);
}
function merge(dst) {
    var args = [];
    for (var _i = 0; _i < (arguments.length - 1); _i++) {
        args[_i] = arguments[_i + 1];
    }
    forEach(arguments, function (obj) {
        if(obj !== dst) {
            forEach(obj, function (value, key) {
                if(!dst.hasOwnProperty(key)) {
                    dst[key] = value;
                }
            });
        }
    });
    return dst;
}
angular.module('ui.routing', []);
