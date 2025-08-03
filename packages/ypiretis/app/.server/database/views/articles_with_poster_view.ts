import type {InferSelectViewModel} from "drizzle-orm";
import {eq, getTableColumns} from "drizzle-orm";

import {sqliteView} from "drizzle-orm/sqlite-core";

import ARTICLES_TABLE from "../tables/articles_table";
import USERS_TABLE from "../tables/users_table";

const ARTICLES_WITH_POSTER_VIEW = sqliteView("articles_with_poster").as(
    (query) => {
        return query
            .select({
                ...getTableColumns(ARTICLES_TABLE),

                poster: {
                    ...getTableColumns(USERS_TABLE),
                },
            })
            .from(ARTICLES_TABLE)
            .innerJoin(
                USERS_TABLE,
                eq(ARTICLES_TABLE.posterUserID, USERS_TABLE.id),
            );
    },
);

export type IArticlesWithPosterView = typeof ARTICLES_WITH_POSTER_VIEW;

export type ISelectArticleWithPoster =
    InferSelectViewModel<IArticlesWithPosterView>;

export default ARTICLES_WITH_POSTER_VIEW;
