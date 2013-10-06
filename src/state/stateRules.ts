/// <reference path="state.ts" />

class StateRules {
    private static nameValidation = /^\w+(\.\w+)*?$/;

    public static validateName(name: string) {
        if (!StateRules.nameValidation.test(name) || name === rootName)
            throw new Error("Invalid name: '" + name + "'.");
    }
}