import {index, integer, sqliteTable} from "drizzle-orm/sqlite-core";

import UPLOADS_TABLE from "./uploads_table";

// **IMPORTANT:** This is a dummy table used for typing purposes only! Do NOT
// use this table when querying the database!

// **HACK:** I would use types instead of creating an object for this generic
// typing... but... that seemed complicated since Drizzle does not provide a
// straight-forward way of constructing the required typings without getting
// knee-deep into its internals. (that I could see)
//
// So, we'll use this minimum columns unregistered table to create our generic
// interface.
const ATTACHMENTS_TABLE = sqliteTable(
    // **HACK:** The table name is treated as a constant literal if we do not
    // broaden its typing here.
    "attachments" as string,
    {
        targetID: integer("target_id").notNull(),

        uploadID: integer("upload_id")
            .notNull()
            .unique()
            .references(() => UPLOADS_TABLE.id, {onDelete: "cascade"}),
    },

    (table) => {
        return [
            index("attachments_target_id_upload_id_idx").on(
                table.targetID,
                table.uploadID,
            ),
        ];
    },
);

export type IInsertAttachment = Readonly<typeof ATTACHMENTS_TABLE.$inferInsert>;

export type ISelectAttachment = Readonly<typeof ATTACHMENTS_TABLE.$inferSelect>;

export type IAttachmentsTable = typeof ATTACHMENTS_TABLE;

export default ATTACHMENTS_TABLE;
