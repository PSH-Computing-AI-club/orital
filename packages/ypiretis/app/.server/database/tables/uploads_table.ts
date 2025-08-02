import {index, integer, sqliteTable, text} from "drizzle-orm/sqlite-core";

import {ulid} from "ulid";

import temporalInstant, {
    DEFAULT_TEMPORAL_INSTANT,
} from "../types/temporal_instant";

import USERS_TABLE from "./users_table";

const UPLOADS_TABLE = sqliteTable(
    "uploads",
    {
        id: integer("id").primaryKey({autoIncrement: true}),

        uploadID: text("upload_id", {length: 26})
            .notNull()
            .unique()
            .$defaultFn(() => ulid()),

        uploaderUserID: integer("uploader_user_id")
            .notNull()
            .references(() => USERS_TABLE.id, {onDelete: "cascade"}),

        fileName: text("file_name", {length: 256}).notNull(),

        fileSize: integer("file_size").notNull(),

        mimeType: text("mime_type").notNull(),

        createdAt: temporalInstant("created_at")
            .notNull()
            .default(DEFAULT_TEMPORAL_INSTANT),
    },

    (table) => {
        return [index("uploads_created_at_idx").on(table.createdAt)];
    },
);

export type IInsertUpload = Readonly<typeof UPLOADS_TABLE.$inferInsert>;

export type ISelectUpload = Readonly<typeof UPLOADS_TABLE.$inferSelect>;

export type IUpdateUpload = Partial<IInsertUpload>;

export type IUploadsTable = typeof UPLOADS_TABLE;

export default UPLOADS_TABLE;
