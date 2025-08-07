import {integer, sqliteTable} from "drizzle-orm/sqlite-core";

import noCaseText from "../types/no_case_text";
import temporalInstant, {
    DEFAULT_TEMPORAL_INSTANT,
} from "../types/temporal_instant";

const USERS_TABLE = sqliteTable("users", {
    id: integer("id").primaryKey({autoIncrement: true}),

    accountID: noCaseText("account_id").notNull().unique(),

    firstName: noCaseText("first_name").notNull(),

    lastName: noCaseText("last_name").notNull(),

    createdAt: temporalInstant("created_at")
        .notNull()
        .default(DEFAULT_TEMPORAL_INSTANT),
});

export type IUsersTable = typeof USERS_TABLE;

export type IInsertUser = Omit<
    Readonly<IUsersTable["$inferInsert"]>,
    "createdAt" | "id"
>;

export type ISelectUser = Readonly<IUsersTable["$inferSelect"]>;

export type IUpdateUser = Partial<IInsertUser>;

export default USERS_TABLE;
