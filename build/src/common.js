'use strict';
var isDefined = angular.isDefined, isFunction = angular.isFunction, isString = angular.isString, isObject = angular.isObject, forEach = angular.forEach, extend = angular.extend, copy = angular.copy;
function inherit(parent, extra) {
    return extend(new (extend(function () {
    }, {
        prototype: parent
    }))(), extra);
}
function toName(named) {
    return isString(named) ? named : named.fullname;
}
angular.module('ui.routing', []);
