# Angular Routing

[![Build Status](https://travis-ci.org/dotJEM/angular-routing.png?branch=master)](https://travis-ci.org/dotJEM/angular-routing)

# NOTE: Alpha version 0.2

Inspired by the UI-Router project by Angular-ui, this project came to life as I wanted
to provide what I belive is more "true states" where the transitions could be
an important part of the implementation.

The UI-Route project can be found here: https://github.com/angular-ui/ui-router

One important note is that this is developed using TypeScript, yet following the
basic style of how Angular modules, services and directives is written

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

#### Samples

Some initial samples can be found at:

 - http://dotjem.github.com/angular-routing/samples/

These are currently "work in progress", but can already demonstrate some of the core concepts.
