/// <reference path="../lib/angular/angular-1.0.d.ts" />
/*jshint globalstrict:true*/
/*global angular:false*/
'use strict';
var isDefined = angular.isDefined, isUndefined = angular.isUndefined, isFunction = angular.isFunction, isString = angular.isString, isObject = angular.isObject, isArray = angular.isArray, forEach = angular.forEach, extend = angular.extend, copy = angular.copy, equals = angular.equals, element = angular.element;
function inherit(parent, extra) {
    return extend(new (extend(function () {
    }, {
        prototype: parent
    }))(), extra);
}
function toName(named) {
    return isString(named) ? named : named.$fullname || named.fullname;
}
function injectFn(arg) {
    if(isArray(arg)) {
        for(var i = 0; i < arg.length; i++) {
            if(i < arg.length - 1 && !isString(arg[i])) {
                return null;
            } else if(i === arg.length - 1 && isFunction(arg[i])) {
                return arg[i];
            }
        }
    }
    return null;
}
//TODO: Taken fom Angular core, copied as it wasn't registered in their API, and couln't figure out if it was
//      a function of thie angular object.
function toKeyValue(obj) {
    var parts = [];
    forEach(obj, function (value, key) {
        parts.push(encodeUriQuery(key, true) + (value === true ? '' : '=' + encodeUriQuery(value, true)));
    });
    return parts.length ? parts.join('&') : '';
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
    return encodeUriQuery(val, true).replace(/%26/gi, '&').replace(/%3D/gi, '=').replace(/%2B/gi, '+');
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
    return encodeURIComponent(val).replace(/%40/gi, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
}
angular.module('dotjem.routing', []);
