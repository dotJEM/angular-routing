/// <reference path="../lib/angular/angular-1.0.d.ts" />

/*jshint globalstrict:true*/
/*global angular:false*/

'use strict';

var isDefined = angular.isDefined,
    isUndefined = angular.isUndefined,
    isFunction = angular.isFunction,
    isString = angular.isString,
    isObject = angular.isObject,
    isArray = angular.isArray,
    forEach = angular.forEach,
    extend = angular.extend,
    copy = angular.copy,
    equals = angular.equals,
    element = angular.element;

function inherit(parent, extra?) {
    return extend(new (extend(function () { }, { prototype: parent }))(), extra);
}

function toName(named: any) {
    return isString(named) ? named : named.$fullname || named.fullname;
}

function injectFn(arg: any[]) {
    if (isArray(arg)) {
        for (var i = 0; i < arg.length; i++) {
            if (i < arg.length - 1 && !isString(arg[i]))
                return null;
            else if (i === arg.length - 1 && isFunction(arg[i]))
                return arg[i];
        }
    }
    return null;
}

interface IParam {
    name: string;
    converter: string;
    args: string;
    index: number;
    lastIndex: number;
}

//var paramsRegex = new RegExp('\x2F((:(\\w+))|(\\{((\\w+)(\\((.*?)\\))?:)?(\\w+)\\}))', 'g');
//function parseParams(path: string): IParam[]{
//    var match: RegExpExecArray,
//        params = [];

//    if (path === null)
//        return params;

//    while ((match = paramsRegex.exec(path)) !== null) {
//        params.push({
//            name: match[3] || match[9],
//            converter: match[6] || '',
//            args: match[8],
//            index: match.index,
//            lastIndex: paramsRegex.lastIndex
//        });
//    }

//    return params;
//}

angular.module('ui.routing', []);