declare module dotjem.routing {

    interface IInjectService extends ng.auto.IInjectorService {
        accepts(fn: any): boolean;
        create(fn): IInvoker;
    }

    interface IInvoker {
        (locals?: any): any;
    }

    interface IView {
        template?: any;
        controller?: any;
        locals?: any;
        sticky?: string;
    }
    
    interface IStoredView extends IView {
        template?: ng.IPromise<any>;
        version: number;
    }

    interface IViewMap {
        [name: string]: IStoredView;
    }

    interface IViewTransaction extends IViewServiceBase {
        commit();
        cancel();
        completed: boolean;

        prepUpdate(name: string, args: IView): (locals?: any) => IViewServiceBase;
        prepCreate(name: string, args: IView): (locals?: any) => IViewServiceBase;
        pending(name?: string): any;
    }

    interface IViewServiceBase {
        clear(name?: string): IViewServiceBase;

        update(name: string, args: IView): IViewServiceBase;
        create(name: string, args: IView): IViewServiceBase;

        get (name: string): IStoredView;
        get (): IViewMap;

        refresh(name?: string, data?: any): IViewServiceBase;
    }

    interface IViewService extends IViewServiceBase {
        beginUpdate(): IViewTransaction;
    }

    interface ITemplateService {
        (template: string): ng.IPromise<any>;
        (template: (...args: any[]) => any): ng.IPromise<any>;
        (template: { url: string; fn: (...args: any[]) => any; html: string; }): ng.IPromise<any>;

        fn(template: string): ng.IPromise<any>;
        fn(template: (...args: any[]) => any): ng.IPromise<any>;
        fn(template: { url: string; fn: (...args: any[]) => any; html: string; }): ng.IPromise<any>;
    }

    interface IRoute {
        state?: string;
        action?: (...args: any[]) => any;
        redirectTo?: any;
        reloadOnSearch: boolean;
    }

    interface IRouteProvider {
        when(path: string, route: any): IWhenRouteProvider;
        when(path: string, route: IRoute): IWhenRouteProvider;

        convert(name: string, converter: (arg: any) => any): IRouteProvider;
        convert(name: string, converter: (...args: any[]) => any): IRouteProvider;

        decorate(name: string, decorator: (...args: any[]) => any): IRouteProvider;
        decorate(name: string, decorator: any[]): IRouteProvider;

        otherwise(redirectPath: string): IRouteProvider;

        ignoreCase(): IRouteProvider;
        matchCase(): IRouteProvider;
    }

    interface IWhenRouteProvider extends IRouteProvider {
        $route: { path: string; params: any; name: string; };
    }
    
    interface IRouteService {
        reload: () => void;
        change: (args: { route: string; params?: any; replace?: boolean; }) => void;
        format: (route: string, params?: any, base?: boolean) => string;
        current?: any;
    }

    interface IState {
        children?: any;
        route?: string;
        reloadOnSearch?: boolean;

        onEnter?: any;
        onExit?: any;

        views?: any;
        scrollTo?: any;
        resolve?: any;
    }

    interface IRegisteredState extends IState {
        $fullname: string;
    }

    interface ITransition {
        before?: (...args: any[]) => any;
        between?: (...args: any[]) => any;
        after?: (...args: any[]) => any;
    }

    interface ITransitionHandler {
        (...args: any[]): any;
    }

    interface IStateProvider extends ITransitionProviderBase {
        state(name: string, state: any): IStateProvider;
    }

    interface IStateService {
        root: any;
        transition: any;
        reload: (state?) => void;
        current?: any;
        params?: any;
        lookup(path: string): any;
        goto(state: string, params?: any);
        goto(state: any, params?: any);

        url(base?: boolean);
        url(state?: string, base?: boolean);
        url(state?: string, params?: any, base?: boolean);
        url(state?: any, base?: boolean);
        url(state?: any, params?: any, base?: boolean);

        is(state?: string);
        is(state?: any);
        isActive(state?: string);
        isActive(state?: any);
    }

    interface ITransitionService {        root: any;        find: (from: any, to: any) => any;    }

    interface ITransitionProvider extends ITransitionProviderBase {
        onEnter(state: string, handler: ITransitionHandler);
        onEnter(state: string, handler: ITransition);
        onEnter(state: string, handler: any);

        onEnter(state: any, handler: ITransitionHandler);
        onEnter(state: any, handler: ITransition);
        onEnter(state: any, handler: any);

        onExit(state: string, handler: ITransitionHandler);
        onExit(state: string, handler: ITransition);
        onExit(state: string, handler: any);

        onExit(state: any, handler: ITransitionHandler);
        onExit(state: any, handler: ITransition);
        onExit(state: any, handler: any);
    }

    interface ITransitionProviderBase {
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
        transition(from: any, to: any, handler: any): IStateProvider;    }
}