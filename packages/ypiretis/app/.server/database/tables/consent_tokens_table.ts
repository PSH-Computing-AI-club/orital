import {index, integer, sqliteTable, text} from "drizzle-orm/sqlite-core";

import secretText from "../types/secret_text";
import temporalInstant from "../types/temporal_instant";

import CALLBACK_TOKENS_TABLE from "./callback_tokens_table";

const CONSENT_TOKENS_TABLE = sqliteTable(
    "consent_tokens",
    {
        id: integer("id").primaryKey({autoIncrement: true}),

        hash: secretText("hash").notNull().unique(),

        accountID: text("account_id").notNull(),

        callbackTokenID: integer("callback_token_id")
            .notNull()
            .unique()
            .references(() => CALLBACK_TOKENS_TABLE.id, {onDelete: "cascade"}),

        createdAt: temporalInstant("created_at").notNull(),

        expiresAt: temporalInstant("expires_at").notNull(),
    },

    (table) => {
        return [
            index("consent_tokens_idx_hash").on(table.hash),
            index("consent_tokens_idx_expires_at").on(table.expiresAt),
        ];
    },
);

export type IInsertConsentToken = Readonly<
    typeof CONSENT_TOKENS_TABLE.$inferInsert
>;

export type ISelectConsentToken = Readonly<
    typeof CONSENT_TOKENS_TABLE.$inferSelect
>;

export type IConsentTokensTable = typeof CONSENT_TOKENS_TABLE;

export default CONSENT_TOKENS_TABLE;
