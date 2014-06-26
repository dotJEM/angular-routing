/// <reference path="../refs.d.ts" />
interface IViewScope extends ng.IScope {
    refresh?: (data?: any) => void;
}
/**
* @ngdoc directive
* @name dotjem.routing.directive:jemView
* @restrict ECA
*
* @description
* # Overview
* `jemView` is a directive that complements the {@link dotjem.routing.$state $state} service by
* including the rendered template of the current state into the main layout (`index.html`) file.
* Every time the current route changes, the included view changes with it according to the
* configuration of the `$state` service.
*
* # animations
* - enter - animation is used to bring new content into the browser.
* - leave - animation is used to animate existing content away.
*
* The enter and leave animation occur concurrently.
*
* @param {string} jemView|name Name of the view
* @param {string} loader Url to a template to display while the view is prepared.
*/
/**
* @ngdoc event
* @name dotjem.routing.directive:jemView#$viewContentLoaded
* @eventOf dotjem.routing.directive:jemView
*
* @eventType emit on the current jemView scope
*
* @description
* Emitted every time the jemView content is reloaded.
*/
/**
* @ngdoc event
* @name dotjem.routing.directive:jemView#$refresh
* @eventOf dotjem.routing.directive:jemView
*
* @eventType broadcast on the current jemView scope
*
* @description
* This event is broadcasted on the view scope unless the view scope defines a refresh function.
* <br/>
* Refresh happens for sticky views when the sticky flag remains the same during an update.
*
* @param {Object} angularEvent Synthetic event object.
* @param {string} name The name of the view where the broadcast originated.
* @param {Object} name Any data that may have been provided for a refresh.
*/
declare var jemViewDirective: any[];
