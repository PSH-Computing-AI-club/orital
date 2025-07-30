import {AsyncLocalStorage} from "node:async_hooks";

import type {IDatabase, ITransaction} from "../configuration/database";
import DATABASE from "../configuration/database";

export type ITransactionContext = IDatabase | ITransaction;

export type ITransactionContextCallback = (
    transaction: ITransaction,
) => Promise<void> | void;

export const TRANSACTION_CONTEXT = new AsyncLocalStorage<ITransaction>();

export function createTransaction(
    callback: ITransactionContextCallback,
): Promise<void> {
    return DATABASE.transaction(async (transaction) => {
        TRANSACTION_CONTEXT.run(transaction, () => {
            return callback(transaction);
        });
    });
}

export function useTransaction(): ITransactionContext {
    return TRANSACTION_CONTEXT.getStore() ?? DATABASE;
}
