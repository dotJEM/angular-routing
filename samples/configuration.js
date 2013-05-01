var x;
x.State('blog', {
    goto: 'recent',
    children: {
        'recent': {
        },
        'category': {
        },
        'archive': {
        },
        'single': {
        }
    },
    onenter: {
        from: 'about',
        handler: function () {
        }
    },
    onexit: {
        to: 'about',
        handler: function () {
        }
    }
}).State('about', {
    children: {
        'cv': {
        },
        'description': {
        }
    },
    onenter: function () {
    },
    onexit: function () {
    }
});
x.State('root', {
});
x.State('root.blog', {
});
x.State('root.blog.recent', {
});
x.State('root.blog.category', {
});
x.State('root.blog.archive', {
});
x.State('root.blog.single', {
});
x.State('root.about', {
});
x.State('root.about.cv', {
});
x.State('root.about.description', {
});
x.Tansition('about', 'blog', function () {
});
x.Tansition('blog', 'about', function () {
});
x.Tansition('about', '*', function () {
});
x.Tansition('*', 'about', function () {
});
var goto, noop, complete;
x.State('wizard', {
    goto: 'step1',
    children: {
        'step1': {
            actions: {
                next: '.step2',
                prev: noop
            }
        },
        'step2': {
            actions: {
                next: '.step3',
                prev: '.step1'
            }
        },
        'step3': {
            actions: {
                next: '.step4',
                prev: '.step2'
            }
        },
        'step4': {
            actions: {
                next: '.step5',
                prev: '.step3'
            }
        },
        'step5': {
            actions: {
                next: '.step6',
                prev: '.step4'
            }
        },
        'step6': {
            actions: {
                next: complete,
                prev: '.step5'
            }
        }
    },
    onenter: function () {
    },
    onexit: function () {
    }
});
//@ sourceMappingURL=configuration.js.map
