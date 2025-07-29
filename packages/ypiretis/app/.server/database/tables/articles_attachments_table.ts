import {index, integer, sqliteTable} from "drizzle-orm/sqlite-core";

import ARTICLES_TABLE from "./articles_table";
import UPLOADS_TABLE from "./uploads_table";

const ARTICLES_ATTACHMENTS_TABLE = sqliteTable(
    "articles_attachments",
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
            index("articles_attachments_target_id_idx").on(table.targetID),

            index("articles_attachments_target_id_upload_id_idx").on(
                table.targetID,
                table.uploadID,
            ),
        ];
    },
);

export type IInsertArticleAttachment = Readonly<
    typeof ARTICLES_ATTACHMENTS_TABLE.$inferInsert
>;

export type ISelectArticleAttachment = Readonly<
    typeof ARTICLES_ATTACHMENTS_TABLE.$inferSelect
>;

export type IArticlesAttachmentsTable = typeof ARTICLES_ATTACHMENTS_TABLE;

export default ARTICLES_ATTACHMENTS_TABLE;
