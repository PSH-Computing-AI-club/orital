import {index, integer, sqliteTable} from "drizzle-orm/sqlite-core";

import noCaseText from "../types/no_case_text";
import secretText from "../types/secret_text";
import temporalInstant from "../types/temporal_instant";

const GRANT_TOKENS_TABLE = sqliteTable(
    "grant_tokens",
    {
        id: integer("id").primaryKey({autoIncrement: true}),

        hash: secretText("hash").notNull().unique(),

        accountID: noCaseText("account_id").notNull(),

        createdAt: temporalInstant("created_at").notNull(),

        expiresAt: temporalInstant("expires_at").notNull(),
    },

    (table) => {
        return [
            index("grant_tokens_idx_hash").on(table.hash),
            index("grant_tokens_idx_expires_at").on(table.expiresAt),
        ];
    },
);

export type IGrantTokensTable = typeof GRANT_TOKENS_TABLE;

export type IInsertGrantToken = Readonly<IGrantTokensTable["$inferInsert"]>;

export type ISelectGrantToken = Readonly<IGrantTokensTable["$inferSelect"]>;

export type IUpdateGrantToken = Partial<IInsertGrantToken>;

export default GRANT_TOKENS_TABLE;
