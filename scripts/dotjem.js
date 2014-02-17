/// <reference path="_references.d.ts" />
angular.module('dotjem.routing.pages', [
    'dotjem.routing',
    'ngAnimate',
    'dotjem.routing.pages.docs'
]);

angular.module('dotjem.routing.pages').config([
    '$stateProvider', function (sp) {
        sp.state('home', {
            route: '/',
            views: { 'main': { template: 'templates/home.html' } }
        }).state('tutorial', {
            route: '/tutorial',
            views: { 'main': { template: 'templates/tutorials/step0.html' } }
        }).state('tutorial.step1', {
            route: '/starting',
            views: { 'step': { template: 'templates/tutorials/step1.starting.html' } }
        }).state('tutorial.step2', {
            route: '/views',
            views: { 'step': { template: 'templates/tutorials/step2.views.html' } }
        }).state('tutorial.step3', {
            route: '/controllers',
            views: { 'step': { template: 'templates/tutorials/step3.controller.html' } }
        }).state('tutorial.step4', {
            route: '/nestedstates',
            views: { 'step': { template: 'templates/tutorials/step4.nestedstates.html' } }
        }).state('tutorial.step5', {
            route: '/routeparameters',
            views: { 'step': { template: 'templates/tutorials/step5.routeparams.html' } }
        }).state('tutorial.step6', {
            route: '/transitions',
            views: { 'step': { template: 'templates/tutorials/step6.transitions.html' } }
        });
    }
]);

angular.module('dotjem.routing.pages').controller('siteController', [
    '$scope', '$state', 'docs', function ($scope, $state, docs) {
        $scope.tab = 'basic';
        $scope.modules = docs;
        $scope.isActive = $state.isActive;
    }
]);

angular.module('dotjem.routing.pages').service('docs', [
    function () {
        var MODULE_DIRECTIVE = /^(.+)\.directive:([^\.]+)$/, MODULE_DIRECTIVE_INPUT = /^(.+)\.directive:input\.([^\.]+)$/, MODULE_FILTER = /^(.+)\.filter:([^\.]+)$/, MODULE_CUSTOM = /^(.+)\.([^\.]+):([^\.]+)$/, MODULE_SERVICE = /^(.+)\.([^\.]+?)(Provider)?$/, MODULE_TYPE = /^([^\.]+)\..+\.([A-Z][^\.]+)$/;

        var modules = { $home: null };
        angular.forEach(NG_DOCS.pages, function (page) {
            page.locator = page.id.replace(':', '.');
            page.title = page.shortName.substring(page.shortName.lastIndexOf('.') + 1);
            var match, id = page.id;
            var mod = modules[page.module] = modules[page.module] || {
                types: [],
                filters: [],
                directives: [],
                services: {},
                others: [],
                overview: null
            };

            switch (page.type) {
                case 'interface':
                    mod.types.push(page);
                    break;
                case 'directive':
                    mod.directives.push(page);
                    break;
                case 'overview':
                    mod.overview = page;
                    modules.$home = page.locator;
                    break;
                default:
                    if (match = id.match(MODULE_FILTER)) {
                        mod.filters.push(page);
                    } else if (match = id.match(MODULE_DIRECTIVE)) {
                        mod.directives.push(page);
                    } else if (match = id.match(MODULE_DIRECTIVE_INPUT)) {
                        mod.directives.push(page);
                    } else if (match = id.match(MODULE_CUSTOM)) {
                        mod.others.push(page);
                    } else if (match = id.match(MODULE_TYPE)) {
                        mod.types.push(page);
                    } else if (match = id.match(MODULE_SERVICE)) {
                        //TODO: Push to service or it provider
                        var key = match[2].replace('$', ' ');
                        var service = mod.services[key] = mod.services[key] || {};
                        if (match[3]) {
                            service.provider = page;
                        } else {
                            service.instance = page;
                        }
                        mod.services.$any = true;
                    } else {
                        mod.others.push(page);
                    }
            }
        });
        return modules;
    }
]);
//# sourceMappingURL=dotjem.js.map
