/// <reference path="state.ts" />

class StateRules {
    private static nameValidation = /^\w+(\.\w+)*?$/;
    private static targetValidation = /^\$?\w+(\.\w+)*(\.[*])?$/;

    public static validateName(name: string) {
        if (!StateRules.nameValidation.test(name) || name === rootName)
            throw new Error("Invalid name: '" + name + "'.");
    }

    public static validateTarget(target: string): bool {
        if (target === '*' || targetValidation.test(target))
            return true;
        return false;
    }
}