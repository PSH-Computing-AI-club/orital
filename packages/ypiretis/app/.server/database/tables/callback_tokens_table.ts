import {index, integer, sqliteTable} from "drizzle-orm/sqlite-core";

import secretText from "../types/secret_text";
import temporalInstant from "../types/temporal_instant";

const CALLBACK_TOKENS_TABLE = sqliteTable(
    "callback_tokens",
    {
        id: integer("id").primaryKey({autoIncrement: true}),

        hash: secretText("hash").notNull().unique(),

        createdAt: temporalInstant("created_at").notNull(),

        expiresAt: temporalInstant("expires_at").notNull(),
    },

    (table) => {
        return [
            index("callback_tokens_idx_hash").on(table.hash),
            index("callback_tokens_idx_expires_at").on(table.expiresAt),
        ];
    },
);

export type IInsertCallbackToken = Readonly<
    typeof CALLBACK_TOKENS_TABLE.$inferInsert
>;

export type ISelectCallbackToken = Readonly<
    typeof CALLBACK_TOKENS_TABLE.$inferSelect
>;

export type IUpdateCallbackToken = Partial<IInsertCallbackToken>;

export type ICallbackTokensTable = typeof CALLBACK_TOKENS_TABLE;

export default CALLBACK_TOKENS_TABLE;
