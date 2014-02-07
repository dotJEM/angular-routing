/// <reference path="../refs.d.ts" />

class StateRules {
    private static nameValidation = /^\w+(\.\w+)*?$/;
    private static targetValidation = /^\$?\w+(\.\w+)*(\.[*])?$/;

    public static validateName(name: string) {
        if (!StateRules.nameValidation.test(name) || name === rootName) {
            throw new Error("Invalid name: '" + name + "'.");
        }
    }

    public static validateTarget(target: string): boolean {
        if (target === '*' || StateRules.targetValidation.test(target)) {
            return true;
        }
        return false;
    }
}