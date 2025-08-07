import {Temporal} from "@js-temporal/polyfill";

import {index, integer, sqliteTable, text} from "drizzle-orm/sqlite-core";

import {ulid} from "ulid";

import noCaseText from "../types/no_case_text";
import temporalInstant, {
    DEFAULT_TEMPORAL_INSTANT,
} from "../types/temporal_instant";

import USERS_TABLE from "./users_table";

export const ARTICLE_STATES = {
    draft: "STATE_DRAFT",

    published: "STATE_PUBLISHED",
} as const;

const ARTICLES_TABLE = sqliteTable(
    "articles",
    {
        id: integer("id").primaryKey({autoIncrement: true}),

        articleID: text("article_id", {length: 26})
            .notNull()
            .unique()
            .$defaultFn(() => ulid()),

        posterUserID: integer("poster_user_id")
            .notNull()
            .references(() => USERS_TABLE.id, {onDelete: "cascade"}),

        state: text("state", {
            enum: [ARTICLE_STATES.draft, ARTICLE_STATES.published],
        }).notNull(),

        title: noCaseText("title", {length: 64}).notNull(),

        content: text("content").notNull(),

        createdAt: temporalInstant("created_at")
            .notNull()
            .default(DEFAULT_TEMPORAL_INSTANT),

        updatedAt: temporalInstant("updated_at")
            .notNull()
            .default(DEFAULT_TEMPORAL_INSTANT)
            .$onUpdate(() => Temporal.Now.instant()),

        publishedAt: temporalInstant("published_at"),
    },

    (table) => {
        return [
            index("articles_created_at_idx").on(table.createdAt),
            index("articles_published_at_idx").on(table.publishedAt),
            index("articles_state_idx").on(table.state),
            index("articles_title_idx").on(table.title),
            index("articles_updated_at_idx").on(table.updatedAt),

            index("articles_state_published_at_idx").on(
                table.state,
                table.publishedAt,
            ),
        ];
    },
);

export type IArticleStates =
    (typeof ARTICLE_STATES)[keyof typeof ARTICLE_STATES];

export type IArticlesTable = typeof ARTICLES_TABLE;

export type IInsertArticle = Omit<
    Readonly<IArticlesTable["$inferInsert"]>,
    "articleID" | "createdAt" | "id" | "updatedAt"
>;

export type ISelectArticle = Readonly<IArticlesTable["$inferSelect"]>;

export type IUpdateArticle = Partial<IInsertArticle>;

export default ARTICLES_TABLE;
