/// <reference path="../../refs.d.ts" />
interface ICommand {
    (context: Context): void;
}
declare var cmd: {
    initializeContext: (next: any, params: any, browser: StateBrowser) => ICommand;
    createEmitter: ($transition: any) => ICommand;
    buildChanges: (force: any) => ICommand;
    createTransition: (gotofn: any) => ICommand;
    raiseUpdate: ($rootScope: any) => ICommand;
    updateRoute: ($route: any, update: any) => ICommand;
    before: () => ICommand;
    between: ($rootScope: any) => ICommand;
    after: ($scroll: any, scrollTo: any) => ICommand;
    beginTransaction: ($view: any, $inject: dotjem.routing.IInjectService) => ICommand;
};
