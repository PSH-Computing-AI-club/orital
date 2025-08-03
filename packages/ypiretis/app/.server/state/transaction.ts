import {AsyncLocalStorage} from "node:async_hooks";

import type {IDatabase, ITransaction} from "../configuration/database";
import DATABASE from "../configuration/database";

export type ITransactionContext = IDatabase | ITransaction;

export type ITransactionContextCallback<T = void> = (
    transaction: ITransaction,
) => Promise<T> | T;

export const TRANSACTION_CONTEXT = new AsyncLocalStorage<ITransaction>();

export function createTransaction<T>(
    callback: ITransactionContextCallback<T>,
): Promise<T> {
    return DATABASE.transaction(async (transaction) => {
        return TRANSACTION_CONTEXT.run(transaction, () => {
            return callback(transaction);
        });
    });
}

export function useTransaction(): ITransactionContext {
    return TRANSACTION_CONTEXT.getStore() ?? DATABASE;
}
