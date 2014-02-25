$stateProvider
    .state('about', {
        route: '/about',
        views: {
            main: { template: 'about.html' }
        }
    });

$stateProvider
    .state('contact', {
        route: '/contact',
        views: {
            main: { template: 'contact.html' }
        }
    });