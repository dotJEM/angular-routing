var x;
x.State('blog', {
    goto: 'recent',
    children: {
        'recent': {},
        'category': {},
        'archive': {},
        'single': {}
    },
    // These are just shorthands for transitions, in this case the onenter would equal : .transition('about', 'blog', handler)
    onenter: { from: 'about', handler: () => { } },
    // The the onexit would equal : .transition('blog', 'about', handler)
    onexit: { to: 'about', handler: () => { } },
})
.State('about', {
    children: {
        'cv': {},
        'description': {}
    },
    //Here we generalize, so onenter is just a function, that is the same as: .transition('*', 'about', handler)
    onenter: () => { },
    //Same for on exit, so that is the same as: .transition('about', '*', handler)
    onexit: () => { }
});

//Equivalent to:
x.State('root', {});
x.State('root.blog', {});
x.State('root.blog.recent', {});
x.State('root.blog.category', {});
x.State('root.blog.archive', {});
x.State('root.blog.single', {});
x.State('root.about', {});
x.State('root.about.cv', {});
x.State('root.about.description', {});

x.Tansition('about', 'blog', () => { });
x.Tansition('blog', 'about', () => { });
x.Tansition('about', '*', () => { });
x.Tansition('*', 'about', () => { });

//TODO: How would this support a Wizard Based set of states?...
//      Actions might be a solution, but it adds on top of the interface making things harder
//      and harder to maintain, so the question is if we can make some other implementation to
//      support it? Could be a simple set of utility methods like:
//        - nextSibling(), parent(), firstChild(), prevSibling() etc.
//
//      Then we could say: "$state.goto($state.getNextSibling())"

var goto, noop, complete;
x
.State('wizard', {
    goto: 'step1',
    children: {
        // Note: If an action is a string starting with '.', it is expected to be a sibling state.
        //       action can also be a function.
        // Alternatively we change states to use / seperator and then use simple XPath navigation paradigm

        'step1': { actions: { next: '.step2', prev: noop } },
        'step2': { actions: { next: '.step3', prev: '.step1' } },
        'step3': { actions: { next: '.step4', prev: '.step2' } },
        'step4': { actions: { next: '.step5', prev: '.step3' } },
        'step5': { actions: { next: '.step6', prev: '.step4' } },
        'step6': { actions: { next: complete, prev: '.step5' } },
    },
    //Here we generalize, so onenter is just a function, that is the same as: .transition('*', 'about', handler)
    onenter: () => { },
    //Same for on exit, so that is the same as: .transition('about', '*', handler)
    onexit: () => { }
});