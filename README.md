dotJEM Angular Routing [![Build Status](https://travis-ci.org/dotJEM/angular-routing.png?branch=master)](https://travis-ci.org/dotJEM/angular-routing)
=========

#### Latest release v0.6.14:
 - Source: [angular-routing.js](https://raw.github.com/dotJEM/angular-routing/v0.6.14/build/angular-routing.js)
 - Minified: [angular-routing.min.js](https://raw.github.com/dotJEM/angular-routing/v0.6.14/build/angular-routing.min.js)
 - Folder: [Build](https://github.com/dotJEM/angular-routing/tree/v0.6.14/build)

#### Latest build (currently not automated, so not 100% the latest always):
 - Source: [angular-routing.js](https://raw.github.com/dotJEM/angular-routing/master/build/angular-routing.js)
 - Minified: [angular-routing.min.js](https://raw.github.com/dotJEM/angular-routing/master/build/angular-routing.min.js)
 - Folder: [Build](https://github.com/dotJEM/angular-routing/tree/master/build)

The samples and api reference are currently a work in progress:
 - **Api Reference:** http://dotjem.github.io/angular-routing/#/docs/api/dotjem.routing
 - **Samples:** http://dotjem.github.io/angular-routing/

# Version v0.6.10

Inspired by the UI-Router project by Angular-UI, this project came to life as I wanted
to provide what I believe is more "true states" where the transitions could be
an important part of the implementation.

The UI-Route project can be found here: https://github.com/angular-ui/ui-router

One important note is that this is developed using TypeScript, yet following the
basic style of how Angular modules, services and directives is written.

## Main goal

The goal is to provide a routing concept for Angular that provides a way to
separate views into tiers so that we don't always have to reload the entire main view.

Also I want it to support a variety of page designs, where different types of navigations
take place.

## Features

* `$routeProvider` and `$route` to replace the existing angular routing concept.
* `$stateProvider` and `$state` to manage application states.
* `$stateTransitionProvider` to manage state transitions.
* `$viewProvider` and `$view` to manage view state.
* `jem-view` directive as a replacement for `ng-view`
* `$scroll` and `jem-anchor` directive for scrolling

#### $routeProvider and $route

Through the $routeProvider and $route, backwards compatibility can be obtained
by registering decoraters, this project comes with a module that provides just that.

Aditionally a new concept for parameters is introduced, providing the flexibility to
match and convert parameters only if they are numeric, patterns etc. Furthermore, the ability
to extend on this concept by registering new converters or overwriting existing ones.

By default `num` and `regex` are available.

Also providing the abilty to switch to a case insensitive mode.

#### $stateProvider and $state

Provides the means to define application states with views, controllers and more.

`$stateProvider` will register routes with the `$routeProvider` if a `route` property
is specified on the state, which is really just a short-hand to registering that route
manually.

It can also register specific transitions through the onEnter and onExit properties.

#### $stateTransitionProvider

Allows the configuration of extra behavior or the ability to change the flow of existing states
by registering handlers in great many ways using wildcards, arrays and special `{before, between, after}` handlers
that give a more granulated control over when a handler is called.

Through depending on `$transition`, `$from` and `$to` a transition handler can reject, redirect
or modify what happens during a transition.

#### $viewProvider and $view

`$view` manages the current state of all views and will support different update schemes.

#### Requires

* AngularJS 1.2

## Reporting Issues

When encountering issues and posting them under issues here on github, if possible, it will be much apreciated
if an example is to follow, it would be especially usefull if the issue was recreated using either
http://plnkr.co/ or http://jsfiddle.net/.

Otherwise, try to capture as much detail as possible, the more that is known about the issue and context
the easier it is to help.

Here is a template Plunker that can be used: http://plnkr.co/edit/tpl:Q2P6M278icUckKNmZJ7C
