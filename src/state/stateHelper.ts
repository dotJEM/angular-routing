/// <reference path="stateWrapper.ts" />
/// <reference path="stateFactory.ts" />


module ui.routing {
    //TODO: Implement as Angular Provider.
    export class StateHelper {
        private static nameValidation = /^\w+(\.\w+)*?$/;

        public static validateName(name: string) {
            if (StateHelper.nameValidation.test(name))
                return;

            throw new Error("Invalid name: '" + name + "'.");
        }
      
    }
}