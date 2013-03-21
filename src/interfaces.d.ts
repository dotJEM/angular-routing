/// <reference path="../lib/angular/angular-1.0.d.ts" />

module ui.routing {
    interface IView {
        template: ng.IPromise;
        controller: any;
        version: number;
    }

    interface IViewMap {
        [name: string]: IView;
    }

    interface IViewUpdateTransaction {
        commit();
        cancel();
    }

    interface IViewService {
        clear(name?: string);
        setOrUpdate(viewname: string, template?: any, controller?: any);
        setIfAbsent(viewname: string, template?: any, controller?: any);
        get (viewname: string): IView;
        get (): IViewMap;

        beginUpdate(): IViewUpdateTransaction;
    }

    interface ITemplateService {
        get (template: string): ng.IPromise;
        get (template: (...args: any[]) => any): ng.IPromise;
        get (template: { url: string; fn: (...args: any[]) => any; html: string; }): ng.IPromise;
    }

    interface IRoute {
        state?: any;
        action?: (...args: any[]) => any;
        redirectTo?: any;
    }

    interface IRouteProvider {
        when(path: string, route: IRoute): IRouteProvider;
        convert(name: string, converter: (...args: any[]) => any): IRouteProvider;
        decorate(name: string, decorator: (...args: any[]) => any): IRouteProvider;
        decorate(name: string, decorator: any[]): IRouteProvider;
        otherwise(redirectPath: string): IRouteProvider;
        ignoreCase(): IRouteProvider;
        matchCase(): IRouteProvider;
    }

    interface IRouteService {
        reload: () => void;
        current?: any;
    }

    interface IState {
        children?: any;
    }

    interface ITransition {
        before?: (...args: any[]) => any;
        between?: (...args: any[]) => any;
        after?: (...args: any[]) => any;
    }

    interface ITransitionHandler {
        (...args: any[]): any;
    }

    interface IStateProvider {
        state(name: string, state: any): IStateProvider;

        transition(from: string, to: string, handler: ITransitionHandler): IStateProvider;
        transition(from: string, to: string, handler: ITransition): IStateProvider;
        transition(from: string, to: string, handler: any): IStateProvider;

        transition(from: string[], to: string[], handler: ITransitionHandler): IStateProvider;
        transition(from: string[], to: string[], handler: ITransition): IStateProvider;
        transition(from: string[], to: string[], handler: any): IStateProvider;

        transition(from: string, to: string[], handler: ITransitionHandler): IStateProvider;
        transition(from: string, to: string[], handler: ITransition): IStateProvider;
        transition(from: string, to: string[], handler: any): IStateProvider;

        transition(from: string[], to: string, handler: ITransitionHandler): IStateProvider;
        transition(from: string[], to: string, handler: ITransition): IStateProvider;
        transition(from: string[], to: string, handler: any): IStateProvider;

        transition(from: any, to: any, handler: ITransitionHandler): IStateProvider;
        transition(from: any, to: any, handler: ITransition): IStateProvider;
        transition(from: any, to: any, handler: any): IStateProvider;

        print(): string;
    }

    interface IStateService {
        root: any;
        transition: any;
        reload: () => void;
        current?: any;
    }
}