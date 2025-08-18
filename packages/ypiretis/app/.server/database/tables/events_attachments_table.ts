import {index, integer, sqliteTable} from "drizzle-orm/sqlite-core";

import ARTICLES_TABLE from "./events_table";
import UPLOADS_TABLE from "./uploads_table";

const EVENTS_ATTACHMENTS_TABLE = sqliteTable(
    "events_attachments",
    {
        targetID: integer("target_id")
            .notNull()
            .references(() => ARTICLES_TABLE.id, {onDelete: "cascade"}),

        uploadID: integer("upload_id")
            .notNull()
            .unique()
            .references(() => UPLOADS_TABLE.id, {onDelete: "cascade"}),
    },

    (table) => {
        return [
            index("events_attachments_target_id_idx").on(table.targetID),

            index("events_attachments_target_id_upload_id_idx").on(
                table.targetID,
                table.uploadID,
            ),
        ];
    },
);

export type IEventsAttachmentsTable = typeof EVENTS_ATTACHMENTS_TABLE;

export type IInsertEventAttachment = Readonly<
    IEventsAttachmentsTable["$inferInsert"]
>;

export type ISelectEventAttachment = Readonly<
    IEventsAttachmentsTable["$inferSelect"]
>;

export type IUpdateEventAttachment = Partial<IInsertEventAttachment>;

export default EVENTS_ATTACHMENTS_TABLE;
