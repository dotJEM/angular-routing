# dotJEM Angular Routing

[![Build Status](https://travis-ci.org/dotJEM/angular-routing.png?branch=master)](https://travis-ci.org/dotJEM/angular-routing)

#### Latest release v0.4:
 - Source: [angular-routing.js](https://raw.github.com/dotJEM/angular-routing/v0.4/build/angular-routing.js)
 - Minified: [angular-routing.min.js](https://raw.github.com/dotJEM/angular-routing/v0.4/build/angular-routing.min.js)
 - Folder: [Build](https://github.com/dotJEM/angular-routing/tree/v0.3.2/build)

#### Latest build (currently not automated, so not 100% the latest always):
 - Source: [angular-routing.js](https://raw.github.com/dotJEM/angular-routing/master/build/angular-routing.js)
 - Minified: [angular-routing.min.js](https://raw.github.com/dotJEM/angular-routing/master/build/angular-routing.min.js)
 - Folder: [Build](https://github.com/dotJEM/angular-routing/tree/master/build)

The samples and api reference are currently a work in progress:
 - **Api Reference:** http://dotjem.github.io/angular-routing/doc/
 - **Samples:** http://dotjem.github.com/angular-routing/samples/

# NOTE: Pre-release version 0.4

Inspired by the UI-Router project by Angular-ui, this project came to life as I wanted
to provide what I belive is more "true states" where the transitions could be
an important part of the implementation.

The UI-Route project can be found here: https://github.com/angular-ui/ui-router

One important note is that this is developed using TypeScript, yet following the
basic style of how Angular modules, services and directives is written

## UI Router Comparison

Some of these are probably more subjevtive that objective, but I will try to be fair to UI Router.

#### Advantages

* Seperation of Application State and View State
* Full support for transition control between state, not just enter/exit or a global state changed handler
* A Simpler view model that still adds more flexibility through the view service
* Sibling lookup in terms of "next" and "prev".
* Parameter converters, UI Router has support for regex parameters but it seems more limited

#### Disadvantages

* No un-nanmed views.
* No abstract states. (Angular Routing don't need them)
* No ui-sref directive, `$state.url(name, params)` brings you a long way and have some advantages.
* No support for route matching through functions.
* Less used.
* Bigger footprint.
* Not compatible with angular 1.0.x

## Main goal

The goal is to provide a routing concept for Angular that provides a way to
seperate views into tiers so that we don't always have to reload the entire main view.

Also I wan't it to support a varaity of page designs, where different types of navigations
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
match and convert parameters only if they are numeric, patterns etc. Further more, the ability
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

* AngularJS 1.1.4 or above

## Reporting Issues

When encountering issues and posting them under issues here on github, if possible, it will be much apreciated
if an example is to follow, it would be especially usefull if the issue was recreated using either
http://plnkr.co/ or http://jsfiddle.net/.

Othherwise, try to capture as much detail as possible, there more that is known about the issue and context
the easier it is to help.
