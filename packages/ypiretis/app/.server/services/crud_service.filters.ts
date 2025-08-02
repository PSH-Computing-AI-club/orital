import type {Column, SQL, SQLWrapper, Table, View} from "drizzle-orm";
import {
    and as drizzleAnd,
    or as drizzleOr,
    not as drizzleNot,
    eq as drizzleEq,
    ne as drizzleNe,
    gt as drizzleGt,
    gte as drizzleGte,
    like as drizzleLike,
    notLike as drizzleNotLike,
    lt as drizzleLt,
    lte as drizzleLte,
    exists as drizzleExists,
    notExists as drizzleNotExists,
    isNull as drizzleIsNull,
    isNotNull as drizzleIsNotNull,
    inArray as drizzleInArray,
    notInArray as drizzleNotInArray,
    between as drizzleBetween,
    notBetween as drizzleNotBetween,
} from "drizzle-orm";

export type IArgumentFilter<
    T extends Table | View,
    S extends SQLWrapper = SQLWrapper,
> = (table: T) => S;

export type IOptionalFilter<T extends Table | View> = (
    table: T,
) => SQL | undefined;

export type IRequiredFilter<T extends Table | View> = (table: T) => SQL;

function makeJunctionFilter(
    operator: (...conditions: (SQLWrapper | undefined)[]) => SQL | undefined,
) {
    return <T extends Table | View>(
        ...filters: IOptionalFilter<T>[]
    ): IOptionalFilter<T> => {
        return (table) => {
            const conditions = filters
                .map((filter) => {
                    return filter(table);
                })
                .filter((sql) => {
                    return !!sql;
                }) as SQL[];

            switch (conditions.length) {
                case 0:
                    return undefined;

                case 1:
                    return conditions[0];

                default:
                    return operator(...conditions);
            }
        };
    };
}

function makeUnaryFilter(operator: (condition: SQLWrapper) => SQL) {
    return <T extends Table | View>(
        filter: IRequiredFilter<T>,
    ): IRequiredFilter<T> => {
        return (table) => {
            const condition = filter(table);

            return operator(condition);
        };
    };
}

function makeBinaryFilter(
    operator: (leftOperand: Column | SQL, rightOperand: SQLWrapper) => SQL,
) {
    return <
        T extends Table | View,
        S extends T["$inferSelect"],
        K extends keyof S,
        V extends S[K],
    >(
        leftValue: K | IArgumentFilter<T, Column | SQL>,
        rightValue: V | IArgumentFilter<T>,
    ): IRequiredFilter<T> => {
        return (table) => {
            const leftOperand =
                typeof leftValue === "function"
                    ? leftValue(table)
                    : // @ts-expect-error - **HACK:** We are validating the typing through
                      // the inferred select model on the user end. So, we can bypass this
                      // error here.
                      (table[leftValue] as Column);

            const rightOperand =
                typeof rightValue === "function"
                    ? // **HACK:** If we get a function here, then we are
                      // expecting it be our special style of function. Nothing
                      // else.
                      (rightValue as IRequiredFilter<T>)(table)
                    : rightValue;

            return operator(leftOperand, rightOperand);
        };
    };
}

function makeTernaryFilter(
    operator: (
        column: Column | SQL,
        leftOperand: SQLWrapper,
        rightOperand: SQLWrapper,
    ) => SQL,
) {
    return <
        T extends Table | View,
        S extends T["$inferSelect"],
        K extends keyof S,
        V extends S[K],
    >(
        middleValue: K | IArgumentFilter<T, Column | SQL>,
        leftValue: V | IArgumentFilter<T>,
        rightValue: V | IArgumentFilter<T>,
    ): IRequiredFilter<T> => {
        return (table) => {
            const middleOperand =
                typeof middleValue === "function"
                    ? middleValue(table)
                    : // @ts-expect-error - **HACK:** See hack labeled in `makeBinaryFilter`.
                      (table[middleValue] as Column);

            const leftOperand =
                typeof leftValue === "function"
                    ? // **HACK:** See hack labeled in `makeBinaryFilter`.
                      (leftValue as IRequiredFilter<T>)(table)
                    : leftValue;

            const rightOperand =
                typeof rightValue === "function"
                    ? // **HACK:** See hack labeled in `makeBinaryFilter`.
                      (rightValue as IRequiredFilter<T>)(table)
                    : rightValue;

            return operator(middleOperand, leftOperand, rightOperand);
        };
    };
}

export function column<
    T extends Table | View,
    S extends T["$inferSelect"],
    K extends keyof S,
>(key: K): IArgumentFilter<T, Column> {
    return (table) => {
        // @ts-expect-error - **HACK:** See hack labeled in `makeBinaryFilter`.
        return table[key];
    };
}

export const and = makeJunctionFilter(drizzleAnd);

export const or = makeJunctionFilter(drizzleOr);

export const not = makeUnaryFilter(drizzleNot);

export const exists = makeUnaryFilter(drizzleExists);

export const notExists = makeUnaryFilter(drizzleNotExists);

export const isNull = makeUnaryFilter(drizzleIsNull);

export const isNotNull = makeUnaryFilter(drizzleIsNotNull);

export const eq = makeBinaryFilter(drizzleEq);

export const ne = makeBinaryFilter(drizzleNe);

export const gt = makeBinaryFilter(drizzleGt);

export const gte = makeBinaryFilter(drizzleGte);

export const lt = makeBinaryFilter(drizzleLt);

export const lte = makeBinaryFilter(drizzleLte);

export const like = makeBinaryFilter(drizzleLike);

export const notLike = makeBinaryFilter(drizzleNotLike);

export const inArray = makeBinaryFilter(drizzleInArray);

export const notInArray = makeBinaryFilter(drizzleNotInArray);

export const between = makeTernaryFilter(drizzleBetween);

export const notBetween = makeTernaryFilter(drizzleNotBetween);
