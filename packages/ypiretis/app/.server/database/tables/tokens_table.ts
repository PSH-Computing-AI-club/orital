import {integer, sqliteTable} from "drizzle-orm/sqlite-core";

import secretText from "../types/secret_text";
import temporalInstant from "../types/temporal_instant";

// **IMPORTANT:** This is a dummy table used for typing purposes only! Do NOT
// use this table when querying the database!

// **HACK:** I would use types instead of creating an object for this generic
// typing... but... that seemed complicated since Drizzle does not provide a
// straight-forward way of constructing the required typings without getting
// knee-deep into its internals. (that I could see)
//
// So, we'll use this minimum columns unregistered table to create our generic
// interface.
const TOKENS_TABLE = sqliteTable(
    // **HACK:** The table name is treated as a constant literal if we do not
    // broader its typing here.
    "tokens" as string,
    {
        id: integer("id").primaryKey({autoIncrement: true}),

        hash: secretText("hash").notNull().unique(),

        createdAt: temporalInstant("created_at").notNull(),

        expiresAt: temporalInstant("expires_at").notNull(),
    },
);

export type IInsertToken = Readonly<typeof TOKENS_TABLE.$inferInsert>;

export type ISelectToken = Readonly<typeof TOKENS_TABLE.$inferSelect>;

export type ITokensTable = typeof TOKENS_TABLE;

export default TOKENS_TABLE;
