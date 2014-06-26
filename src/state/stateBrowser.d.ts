/// <reference path="state.d.ts" />
declare class StateBrowser {
    private root;
    private nameRegex;
    private siblingRegex;
    private indexRegex;
    constructor(root: State);
    public lookup(path: string, stop?: number): State;
    public resolve(origin: any, path: any, wrap?: any): State;
    private selectSibling(index, selected);
    private select(origin, exp, selected);
}
