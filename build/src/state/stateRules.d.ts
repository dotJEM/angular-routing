/// <reference path="../refs.d.ts" />
declare class StateRules {
    private static nameValidation;
    private static targetValidation;
    static validateName(name: string): void;
    static validateTarget(target: string): boolean;
}
