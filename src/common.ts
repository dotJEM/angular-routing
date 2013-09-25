/// <reference path="../lib/angular/angular-1.0.d.ts" />

/*jshint globalstrict:true*/
/*global angular:false*/

'use strict';

/**
 * @ngdoc overview
 * @name dotjem.routing
 * @description
 *
 * Module that provides state based routing, deeplinking services and directives for angular apps.
 */
angular.module('dotjem.routing', []);

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

function toName(named: any) : string {
    return isString(named) ? named : named.$fullname || named.fullname;
}

function injectFn(arg: any): IInjector {
    if (isFunction(arg)) {
        return function(injector: ng.auto.IInjectorService, locals?) {
            return injector.invoke(arg, arg, locals);
        }
    } else if (isArray(arg)) {
        var fn = arg[arg.length - 1];
        return function (injector: ng.auto.IInjectorService, locals?) {
            return injector.invoke(arg, fn, locals);
        }
    }
    return null;
}

interface IInjector {
    (injector: ng.auto.IInjectorService, locals?: any): any;
}

interface IParam {
    name: string;
    converter: string;
    args: string;
    index: number;
    lastIndex: number;
    catchAll: bool;
}

function buildParams(all?, path?, search?) {
  var par = copy(all || {});
  par.$all = copy(all || {});
  par.$path = copy(path || {});
  par.$search = copy(search || {});
  return par;
}

function buildParamsFromObject(params?) {
    var par = copy(params && params.all || {});
    par.$path = copy(params && params.path || {});
    par.$search = copy(params && params.search || {});
    return par;

    // params.path || {};
    // $state.params.$all = params.all;
    // $state.params.$search = params.search;
}

//TODO: Taken fom Angular core, copied as it wasn't registered in their API, and couln't figure out if it was
//      a function of thie angular object.
function toKeyValue(obj, prepend?) {
    var parts = [];
    forEach(obj, function (value, key) {
        parts.push(encodeUriQuery(key, true) + (value === true ? '' : '=' + encodeUriQuery(value, true)));
    });
    return parts.length ? prepend + parts.join('&') : '';
}

/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
 * segments:
 *    segment       = *pchar
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
//TODO: Taken fom Angular core, copied as it wasn't registered in their API, and couln't figure out if it was
//      a function of thie angular object.
function encodeUriSegment(val) {
    return encodeUriQuery(val, true).
               replace(/%26/gi, '&').
               replace(/%3D/gi, '=').
               replace(/%2B/gi, '+');
}


/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a custom
 * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
 * encoded per http://tools.ietf.org/html/rfc3986:
 *    query       = *( pchar / "/" / "?" )
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
//TODO: Taken fom Angular core, copied as it wasn't registered in their API, and couln't figure out if it was
//      a function of thie angular object.
function encodeUriQuery(val, pctEncodeSpaces) {
    return encodeURIComponent(val).
               replace(/%40/gi, '@').
               replace(/%3A/gi, ':').
               replace(/%24/g, '$').
               replace(/%2C/gi, ',').
               replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
}

var errors = {
    routeCannotBeUndefined: 'Can not set route to undefined.',
    valueCouldNotBeMatchedByRegex: "Value could not be matched by the regular expression parameter.",
    regexConverterNotValid: "The Regular-expression converter was not initialized with a valid object.",
    invalidNumericValue: "Value was not acceptable for a numeric parameter.",
    invalidBrowserPathExpression: "Invalid path expression.",
    expressionOutOfBounds: "Expression out of bounds.",
    couldNotFindStateForPath: "Could find state for path."
}