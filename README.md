# Angular Routing

# NOTE: Still in development and getting close to a first working alpha version.

Inspired by the UI-Router project by Angular-ui, this project came to life as I wanted
to provide what I belive is more "true states" where the transitions could be
an important part of the implementation.

The UI-Route project can be found here: https://github.com/angular-ui/ui-router

One important note is that this is developed using TypeScript, yet following the
basic style of how Angular modules, services and directives is written

## Main goal

The goal is to provide a routing concept for Angular that provides a way to
seperate views into tiers so that we don't always have to reload the entire main view.

The idea is to support a varaity of page designs.

## Features

* `$routeProvider` and `$route` to replace the existing angular routing concept.
* `$stateProvider` and `$state` to manage application state and transitions.
* `$viewProvider` and `$view` to manage view state.

#### $routeProvider and $route

Through the $routeProvider and $route, backwards compatibility can be obtained
by registering decoraters, this project comes with a module that provides just that.

Aditionally a new concept for parameters is introduced, providing the flexibility to
match and convert parameters only if they are numeric etc. Further more, the ability
to extend on this concept by registering new converters or overwriting existing ones.

By default `num` and `regex` are available.

Also providing the abilty to switch to a case insensitive mode.

#### $stateProvider and $state

Provides the means to define application states and controll behavior on transitions
and even reject the transition if wanted.

`$stateProvider` will register routes with the `$routeProvider` if a `route` propery
is specified on the state, which is really just a short-hand to registering that route
manually.

#### $viewProvider and $view

`$view` manages the current state of all views and will support different update schemes.

