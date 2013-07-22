# Angular Routing

[![Build Status](https://travis-ci.org/dotJEM/angular-routing.png?branch=master)](https://travis-ci.org/dotJEM/angular-routing)

# NOTE: Pre-release version 0.3.1 

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
* Support for a XPath like lookup of states based on current state or root state.
* Parameter converters, UI Router has support for regex parameters but it seems more limited

#### Disadvantages

* No un-nanmed views
* No abstract states
* No ui-sref directive (planned on some form at least)
** For now, you should be able to bind the url method of $state to the scope and use that in an "a" tag.
* No support for route matching through functions
* Less used
* Bigger footprint

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
* `uiView` as a replacement for `ngView`
* `templateDecorator` for backwards compatiblity (optional)

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

#### Samples

Some initial samples can be found at:

 - http://dotjem.github.com/angular-routing/samples/

These are currently "work in progress", but can already demonstrate some of the core concepts.
