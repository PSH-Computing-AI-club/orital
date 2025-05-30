const SYMBOL_SECRET_BRAND: unique symbol = Symbol();

const SYMBOL_NODE_INSPECT = Symbol.for("nodejs.util.inspect.custom");

const STRINGIFIED_SECRET = "[secret]" as const;

export type ISecretMaybe<T> = T | ISecret<T>;

export interface ISecret<T> {
    [SYMBOL_SECRET_BRAND]: true;

    [SYMBOL_NODE_INSPECT](): typeof STRINGIFIED_SECRET;

    expose(): T;

    toJSON(): typeof STRINGIFIED_SECRET;

    toLocaleString(): typeof STRINGIFIED_SECRET;

    toString(): typeof STRINGIFIED_SECRET;

    valueOf(): typeof STRINGIFIED_SECRET;
}

export function exposeIfSecret<T>(secret: ISecretMaybe<T>): T {
    return isSecret(secret) ? secret.expose() : secret;
}

export function isSecret<T>(value: unknown): value is ISecret<T> {
    return (
        value !== null &&
        typeof value === "object" &&
        SYMBOL_SECRET_BRAND in value
    );
}

export function makeSecretIfPlain<T>(secret: ISecretMaybe<T>): ISecret<T> {
    return isSecret(secret) ? secret : makeSecret(secret);
}

export default function makeSecret<T>(secret: T): ISecret<T> {
    return {
        [SYMBOL_SECRET_BRAND]: true,

        [SYMBOL_NODE_INSPECT]() {
            return STRINGIFIED_SECRET;
        },

        toJSON() {
            return STRINGIFIED_SECRET;
        },

        toLocaleString() {
            return STRINGIFIED_SECRET;
        },

        toString() {
            return STRINGIFIED_SECRET;
        },

        valueOf() {
            return STRINGIFIED_SECRET;
        },

        expose(): T {
            return secret;
        },
    };
}
