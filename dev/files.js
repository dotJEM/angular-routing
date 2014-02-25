if (exports) {
    var files = {
        'src': [
            'src/prefix',
            'build/src/common.js',
            'build/src/route.js',
            'build/src/stateTransition.js',
            'build/src/state.js',
            'build/src/resolve.js',
            'build/src/template.js',
            'build/src/view.js',
            'build/src/scroll.js',
            'build/src/inject.js',
            'build/src/state/state.js',
            'build/src/state/stateBrowser.js',
            'build/src/state/stateComparer.js',
            'build/src/state/stateFactory.js',
            'build/src/state/stateRules.js',
            'build/src/state/stateUrlBuilder.js',
            'build/src/state/transition/commands.js',
            'build/src/state/transition/context.js',
            'build/src/directives/jemView.js',
            'build/src/directives/jemAnchor.js',
            'build/src/directives/jemLink.js',
            'src/suffix'
        ],
        'legacy': [
            'src/legacy/prefix',
            'build/src/legacy/templateDecorator.js',
            'src/legacy/suffix'
        ]
    };
    exports.files = files;
}