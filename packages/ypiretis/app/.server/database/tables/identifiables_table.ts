import {integer, sqliteTable} from "drizzle-orm/sqlite-core";

// **IMPORTANT:** This is a dummy table used for typing purposes only! Do NOT
// use this table when querying the database!

// **HACK:** I would use types instead of creating an object for this generic
// typing... but... that seemed complicated since Drizzle does not provide a
// straight-forward way of constructing the required typings without getting
// knee-deep into its internals. (that I could see)
//
// So, we'll use this minimum columns unregistered table to create our generic
// interface.
const IDENTIFIABLES_TABLE = sqliteTable(
    // **HACK:** The table name is treated as a constant literal if we do not
    // broader its typing here.
    "identifiables" as string,
    {
        id: integer("id").primaryKey({autoIncrement: true}),
    },
);

export type IIdentifiablesTable = typeof IDENTIFIABLES_TABLE;

export type IInsertIdentifiable = Readonly<IIdentifiablesTable["$inferInsert"]>;

export type ISelectIdentifiable = Readonly<IIdentifiablesTable["$inferSelect"]>;

export type IUpdateIdentifiable = Partial<IInsertIdentifiable>;

export default IDENTIFIABLES_TABLE;
