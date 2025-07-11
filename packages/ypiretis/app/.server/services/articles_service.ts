import {Temporal} from "@js-temporal/polyfill";

import {and, desc, eq, getTableColumns, lte, sql} from "drizzle-orm";

import {slug as slugify} from "github-slugger";

import DATABASE from "../configuration/database";

import ARTICLES_TABLE, {
    ARTICLE_STATES as _ARTICLE_STATES,
} from "../database/tables/articles_table";

import type {IPaginationOptions, IPaginationResults} from "./types";

export const ARTICLE_STATES = _ARTICLE_STATES;

export type IArticle = Readonly<typeof ARTICLES_TABLE.$inferSelect> & {
    readonly slug: string;
};

export type IArticleInsert = Omit<
    Readonly<typeof ARTICLES_TABLE.$inferInsert>,
    "articleID" | "createdAt" | "id" | "publishedAt" | "updatedAt"
>;

export type IArticleUpdate = Partial<
    Omit<
        Readonly<typeof ARTICLES_TABLE.$inferInsert>,
        "articleID" | "createdAt" | "id" | "posterUserID" | "updatedAt"
    >
>;

export interface IFindAllPublishedArticlesOptions {
    readonly pagination: IPaginationOptions;
}

export interface IFindAllPublishedArticlesResults {
    readonly articles: IArticle[];

    readonly pagination: IPaginationResults;
}

function mapArticle(article: typeof ARTICLES_TABLE.$inferSelect): IArticle {
    const {title} = article;

    const slug = slugify(title, false);

    return {
        ...article,

        slug,
    };
}

export async function findOneByArticleID(
    articleID: string,
): Promise<IArticle | null> {
    const article = await DATABASE.query.articles.findFirst({
        where: eq(ARTICLES_TABLE.articleID, articleID),
    });

    return article ? mapArticle(article) : null;
}

export async function findAllPublished(
    options: IFindAllPublishedArticlesOptions,
): Promise<IFindAllPublishedArticlesResults> {
    const {pagination} = options;
    const {limit, page} = pagination;

    const offset = (page - 1) * limit;
    const nowInstant = Temporal.Now.instant();

    const results = await DATABASE.select({
        ...getTableColumns(ARTICLES_TABLE),

        articleCount: sql<number>`COUNT(${ARTICLES_TABLE.id}) OVER()`.as(
            "article_count",
        ),
    })
        .from(ARTICLES_TABLE)
        .where(
            and(
                eq(ARTICLES_TABLE.state, ARTICLE_STATES.published),
                lte(ARTICLES_TABLE.publishedAt, nowInstant),
            ),
        )
        .orderBy(desc(ARTICLES_TABLE.publishedAt))
        .limit(limit)
        .offset(offset);

    if (results.length === 0) {
        return {
            articles: [],

            pagination: {
                page,
                pages: 1,
            },
        };
    }

    const {articleCount} = results[0];
    const pages = Math.ceil(articleCount / limit);

    const articles = results.map((result) => {
        const {articleCount: _articleCount, ...article} = result;

        return mapArticle(article);
    });

    return {
        articles,

        pagination: {
            page,
            pages,
        },
    };
}
