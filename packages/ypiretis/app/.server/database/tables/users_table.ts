import {integer, sqliteTable, text} from "drizzle-orm/sqlite-core";

import temporalInstant, {
    DEFAULT_TEMPORAL_INSTANT,
} from "../types/temporal_instant";

const USERS_TABLE = sqliteTable("users", {
    id: integer("id").primaryKey({autoIncrement: true}),

    accountID: text("account_id").notNull().unique(),

    firstName: text("first_name").notNull(),

    lastName: text("last_name").notNull(),

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
