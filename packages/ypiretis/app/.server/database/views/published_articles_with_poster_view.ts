import type {Temporal} from "@js-temporal/polyfill";

import type {InferSelectViewModel} from "drizzle-orm";
import {and, eq, getTableColumns, lte} from "drizzle-orm";

import {sqliteView} from "drizzle-orm/sqlite-core";

import ARTICLES_TABLE, {ARTICLE_STATES} from "../tables/articles_table";
import USERS_TABLE from "../tables/users_table";

import {DEFAULT_TEMPORAL_INSTANT} from "../types/temporal_instant";

const PUBLISHED_ARTICLES_WITH_POSTER_VIEW = sqliteView(
    "published_articles_with_poster",
).as((query) => {
    return query
        .select({
            ...getTableColumns(ARTICLES_TABLE),

            poster: {
                ...getTableColumns(USERS_TABLE),
            },
        })
        .from(ARTICLES_TABLE)
        .where(
            and(
                eq(ARTICLES_TABLE.state, ARTICLE_STATES.published),
                lte(ARTICLES_TABLE.publishedAt, DEFAULT_TEMPORAL_INSTANT),
            ),
        )
        .innerJoin(
            USERS_TABLE,
            eq(ARTICLES_TABLE.posterUserID, USERS_TABLE.id),
        );
});

export type ISelectPublishedArticleWithPoster = Omit<
    InferSelectViewModel<typeof PUBLISHED_ARTICLES_WITH_POSTER_VIEW>,
    "publishedAt" | "state"
> & {
    publishedAt: Temporal.Instant;

    state: (typeof ARTICLE_STATES)["published"];
};

export type IPublishedArticlesWithPosterView =
    typeof PUBLISHED_ARTICLES_WITH_POSTER_VIEW;

export default PUBLISHED_ARTICLES_WITH_POSTER_VIEW;
