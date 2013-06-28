/// <reference path="state.ts" />

module ui.routing {
    //TODO: Implement as Angular Provider.
    export class StateRules {
        private static nameValidation = /^\w+(\.\w+)*?$/;

        public static validateName(name: string) {
            if (StateRules.nameValidation.test(name))
                return;

            throw new Error("Invalid name: '" + name + "'.");
        }
      
    }
}