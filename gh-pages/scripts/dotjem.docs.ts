/// <reference path="_references.d.ts" />

angular.module('dotjem.routing.pages.docs', ['dotjem.routing']);

angular.module('dotjem.routing.pages').config([
    <any>'$stateProvider','$stateTransitionProvider',
    function (sp:dotjem.routing.IStateProvider, stp: dotjem.routing.ITransitionProvider) {
        sp.state('docs', {
                route: '/docs',
                views: { 'main': { template: 'templates/ngdocs.html' } }
            })
            .state('docs.api', {
                route: '/api',
                views: { 'main': { template: 'templates/ngdocs.html' } }
            })
            .state('docs.api.section', {
                route: '/{page}',
                views: {
                    'main.doc': {
                        template: [<any>'$state', '$template', function ($state, $template) {
                            return $template({ url: 'docs/partials/' + $state.params.page.replace(':', '.') + '.html'});
                        }]
                    }
                }
            })
            .state('docs.concepts', {
                route: '/concepts',
                views: { 'main': { template: 'templates/concepts/overview.html' } }
            })
            .state('docs.concepts.states', {
                route: '/states',
                views: { 'main': { template: 'templates/concepts/states.html' } }
            })
            .state('docs.concepts.routes', {
                route: '/routes',
                views: { 'main': { template: 'templates/concepts/routes.html' } }
            })
            .state('docs.concepts.transitions', {
                route: '/transitions',
                views: { 'main': { template: 'templates/concepts/transitions.html' } }
            })
            .state('docs.concepts.views', {
                route: '/views',
                views: { 'main': { template: 'templates/concepts/views.html' } }
            })
            .state('docs.faq', {
                route: '/faq',
                views: { 'main': { template: 'templates/faq.html' } }
            });

        stp.transition('*','docs.api',[
            <any>'$to', '$transition', function(to, trs){
                trs.goto('docs.api.section', { page: 'dotjem.routing' })
            }
        ]);
    }
])