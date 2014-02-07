/// <reference path="../refs.d.ts" />
/// <reference path="stateRules.d.ts" />
/// <reference path="stateFactory.d.ts" />
declare class State {
    private _name;
    private _fullname;
    private _parent;
    private _children;
    private _self;
    private _reloadOnOptional;
    private _route;
    private _scrollTo;
    public children : any;
    public fullname : string;
    public name : string;
    public reloadOnOptional : boolean;
    public self : dotjem.routing.IRegisteredState;
    public parent : State;
    public route : any;
    public root : State;
    public scrollTo : any;
    public views : any;
    public resolve : any;
    constructor(_name: string, _fullname: string, _self: dotjem.routing.IState, _parent?: State);
    public add(child: State): State;
    public resolveRoute(): string;
    public is(state: string): boolean;
    public isActive(state: string): any;
}
