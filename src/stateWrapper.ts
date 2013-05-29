/// <reference path="../lib/angular/angular-1.0.d.ts" />
/// <reference path="common.ts" />
/// <reference path="interfaces.d.ts" />

interface IStateFactory {

}

interface IStateWrapperClass {
    //children: any;
    self: ui.routing.IState;
    fullname: string;
    //reloadOnOptional: bool;

    //parent?: IStateWrapper;
    //route?: any;

    lookup: (names: string[]) => IStateWrapperClass;
}

interface IStateMap {
    [name: string]: IStateWrapperClass;
}

module ui.routing {
    export class StateFactory implements IStateFactory {

    }

    export class StateWrapper implements IStateWrapperClass {
        private children: IStateMap = {};
        private _fullname: string;

        get fullname(): string {
            return this._fullname;
        }

        get self(): IState {
            return this._self;
        }

        //set timeInterval(value: number) {
        //    if (value === undefined) throw 'Please supply time interval';
        //    this._timeInterval = value;
        //}

        constructor(private _self: IState) {

        }

        public lookup(names: string[]): IStateWrapperClass {
            var next = names.shift();

            if (!(next in this.children))
                throw new Error("Could not locate '" + next + "' under '" + this.fullname + "'.");

            return this.children[next].lookup(names);
        }
    }
}