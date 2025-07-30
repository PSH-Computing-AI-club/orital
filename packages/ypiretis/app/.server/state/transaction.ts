import {AsyncLocalStorage} from "node:async_hooks";

import type {IDatabase, ITransaction} from "../configuration/database";
import DATABASE from "../configuration/database";

export type ITransactionContext = IDatabase | ITransaction;

export const TRANSACTION_CONTEXT = new AsyncLocalStorage<ITransaction>();

export function useTransaction(): ITransactionContext {
    return TRANSACTION_CONTEXT.getStore() ?? DATABASE;
}
